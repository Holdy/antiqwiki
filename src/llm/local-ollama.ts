import { ZodType, z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { storySynopsisSchema } from "./local-ollama-types";

export type LLMDataResult =
    | { ok: true; data: any[] }
    | { ok: false; error: string; message: string };

export interface LLMResult {
    message: string;
}

export const getStorySynopsis = async (targetProse: string) => {
    return callChatGPTStructured(
        `You are an AI that responses strictly in JSON format. `,
        `From the following text create a two sentence summary of the story (don't include the title). Use the given title if it is present and only construct one if necessary. 
        If there are locations mentioned in the text(towns, cities, areas ) pick the main one and return it as mainLocation, otherwise return null.
        If there is no story in the text, simply return the storyCount as 0, and if there is more than one story, set the value to 2 etc.`,
        targetProse,
        storySynopsisSchema
    );
};

export const getMentionedLocations = async (
    targetProse: string
): Promise<LLMDataResult> => {
    const result = await callLLM(
        "From the following text, list all explictly mentioned geographic locations (as a json array of strings without preamble). If no locations are present, simply answer with 'no-data-found'",
        targetProse
    );

    if (result.message.includes("no-data-found")) {
        // This is fine - just explicitly no data
        return {
            ok: true,
            data: [],
        };
    } else {
        if (result.message.startsWith("[")) {
            try {
                return {
                    ok: true,
                    data: JSON.parse(result.message),
                };
            } catch (e) {
                return {
                    ok: false,
                    error: `Failed to parse message`,
                    message: result.message,
                };
            }
        } else {
            return {
                ok: false,
                error: "Message does not look like json array",
                message: result.message,
            };
        }
    }
};

export async function callLLM(
    prompt: string,
    targetProse: string
): Promise<LLMResult> {
    const data = {
        stream: false,
        model: "llama3.1:8b",
        options: {
            num_ctx: 4096,
        },
        messages: [
            { role: "user", content: prompt },
            { role: "user", content: targetProse },
        ],
    };

    const fetchResult = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        body: JSON.stringify(data),
    });

    const responseData = await fetchResult.json();
    const messageContent = responseData.message.content;

    return { message: messageContent };
}

export async function callLLMStructured<ZodSchema extends ZodType>(
    prompt: string,
    targetProse: string,
    zodSchema: ZodSchema
): Promise<[Error, null] | [null, z.infer<ZodSchema>]> {
    const data = {
        stream: false,
        model: "llama3.1:8b",
        options: {
            num_ctx: 4096,
        },
        messages: [
            { role: "user", content: prompt },
            { role: "user", content: targetProse },
        ],
        format: zodToJsonSchema(zodSchema),
    };

    const fetchResult = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        body: JSON.stringify(data),
    });

    if (!fetchResult.ok) {
        return [new Error(fetchResult.statusText), null];
    }
    const responseData = await fetchResult.json();
    return [null, zodSchema.parse(JSON.parse(responseData.message.content))];
}

export async function callChatGPTStructured<ZodSchema extends ZodType>(
    systemPrompt: string,
    prompt: string,
    targetProse: string,
    zodSchema: ZodSchema
): Promise<[Error, null] | [null, z.infer<ZodSchema>]> {
    const apiKey = process.env.OPENAI_COM__SECRET_KEY;

    const response_format = {
        type: "json_schema",
        json_schema: {
            name: "StorySynopsis",
            strict: true,
            schema: zodToJsonSchema(zodSchema),
        },
    };

  //  console.log(JSON.stringify(response_format, null, 3));

    const data = {
        model: "gpt-4o-2024-08-06",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
            { role: "user", content: targetProse },
        ],
        response_format,
    };

    const endpointUrl = "https://api.openai.com/v1/chat/completions";

    const fetchResult = await fetch(endpointUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(data),
    });

    if (!fetchResult.ok) {
        console.log(await fetchResult.text());
        return [new Error(fetchResult.statusText), null];
    }
    const responseData = await fetchResult.json();
    console.log(JSON.stringify(responseData, null, 3));
    const jsonSource = responseData.choices[0].message.content
        .replace(/^```json/, "")
        .replace(/```$/, "");
    console.log(`Prepared source:\n${jsonSource}`);
    return [null, zodSchema.parse(JSON.parse(jsonSource))];
}
