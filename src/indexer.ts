// processor.ts chops a source into indexable items (Stories etc)
// the indexer indexes them an links them together.

import * as fs from 'fs';
import * as path from 'path';
import { getStorySynopsis } from "./llm/local-ollama";

const stopWords = fs
    .readFileSync(path.join(__dirname, "lex", "stop-words.txt"))
    .toString()
    .split("\n")
    .map((item) => item.toLowerCase());

const PART_FILENAME_PATTERN = /^l\d+\.txt$/;

const numberFromFilename = (filename: String): number =>
    Number(filename.replace("l", "").replace(".txt", ""));

const writeDataObjectFile = (dataObject: any, fileName: string): void => {
    const lines: string[] = [];

    for (const key of Object.keys(dataObject).sort()) {
        lines.push(`${key}: ${dataObject[key]}`);
    }

    fs.writeFileSync(fileName, lines.join("\n"));
};

const readDataObjectFileIfPresent = (fileName: string): any => {
    if (!fs.existsSync(fileName)) {
        return {};
    }

    const result = {};
    const lines = fs.readFileSync(fileName).toString().split("\n");
    for (const line of lines) {
        const separatorIndex = line.indexOf(":");
        if (separatorIndex !== -1) {
            result[line.substring(0, separatorIndex)] = line
                .substring(separatorIndex + 1)
                .trim();
        }
    }

    return result;
};

function isRomanNumeral(text: string): boolean {
    return text.match(/^[xivm]+$/i) != null || /^\d+$/.test(text) === true;
}

function indexFile(directory: string, fileName: string): void {
    const content = fs.readFileSync(path.join(directory, fileName)).toString();

    const lastIndex = directory.lastIndexOf("/");
    const sourceId = directory.substring(lastIndex + 1).replace("s", "");
    const itemId =
        sourceId + "-" + fileName.replace("l", "").replace(".txt", "");
    console.log("slug: " + itemId);

    // TODO simplify words
    const wordCountMap = {};

    const singleWordStops = [
        "and",
        "of",
        "by",
        "for",
        "far",
        "its",
        "best",
        "in",
        "first",
        "last",
        "worst",
        "the",
        "add",
        "says",
        "pp",
    ];

    const preindexDirectory = path.join(__dirname, "..", "data", "preindex");
    console.log("preindex path :" + preindexDirectory);

    // count words;
    for (const line of content.split("\n")) {
        // todo use unicode word here
        const words = line.matchAll(/\b\w+\b/g);
        for (const wordMatch of words) {
            const word = wordMatch[0]
                .toLowerCase()
                .replace("_", "")
                .replace("_", "");
            if (
                !isRomanNumeral(word) &&
                !stopWords.includes(word) &&
                !singleWordStops.includes(word) &&
                word.length > 1
            ) {
                let currentCount = wordCountMap[word] ?? 0;
                wordCountMap[word] = ++currentCount;
            }
        }
    }

    for (const word of Object.keys(wordCountMap)) {
        const dir = word.substring(0, 2);
        fs.mkdirSync(path.join(preindexDirectory, dir), { recursive: true });
        const preindexFileName = path.join(
            preindexDirectory,
            dir,
            word + ".txt"
        );

        let found = false;
        if (fs.existsSync(preindexFileName)) {
            const current = fs.readFileSync(preindexFileName).toString();
            for (const line of current.split("\n")) {
                if (line.startsWith(itemId + "+")) {
                    found = true;
                    break;
                }
            }
        }
        if (!found) {
            fs.appendFileSync(
                preindexFileName,
                itemId + "+" + wordCountMap[word] + "\n"
            );
        }
    }
}

/**
 * Indexes the items in a directory (all part of one book)
 * The two main outputs are :
 *  1) An index file per item
 *  2) Linking if files together. (previous and next links)
 */
export async function indexItemsIn(directory: string): Promise<void> {
    // find the 'l' files
    const entries = fs
        .readdirSync(directory)
        .filter((entry) => entry.match(PART_FILENAME_PATTERN));

    entries.sort((a, b) => {
        if (a.match(PART_FILENAME_PATTERN) && b.match(PART_FILENAME_PATTERN)) {
            const aNum = Number(a.replace("l", "").replace(".txt", ""));
            const bNum = Number(b.replace("l", "").replace(".txt", ""));
            return aNum - bNum;
        } else {
            return a < b ? 1 : -1;
        }
    });

    const partFiles = entries.filter((entry) =>
        entry.match(PART_FILENAME_PATTERN)
    );

    let previousItemNumber = 0;
    for (let index = 0; index < partFiles.length; index++) {
        const entry = partFiles[index];

        const fullFilePath = path.join(directory, entry);
        console.log("would index: " + fullFilePath);

        indexFile(directory, entry);

        const nextFileNumber =
            index + 1 < partFiles.length
                ? numberFromFilename(partFiles[index + 1])
                : 0;
        const fileNumber = numberFromFilename(entry);
        const indexFileName = path.join(
            directory,
            `l${fileNumber}.metadata.txt`
        );

        // TODO - -preserve summary and title
        /*  Providate a 2 sentence summary and the title (made up if necessary) of the story below.
            If there's no story, set the containsStory boolean to false.

            -- The summary will be shown in search results,
            and of course if the story goes on to untamed-earth - 
                the 2 line summary will be the summ.
                title will be the title.
        */

        const indexData = readDataObjectFileIfPresent(indexFileName);

        indexData.previous = previousItemNumber;
        indexData.next = nextFileNumber;

        if (!indexData.summary) {
            const story = fs
                .readFileSync(indexFileName.replace(/\.metadata\./, "."))
                .toString();
            const [error, data] = await getStorySynopsis(story);
            if (!error) {
                indexData.summary =
                    data.summarySentence1 + " " + data.summarySentence2;
                indexData.storyCount = data.storyCount;
                indexData.title = data.storyTitle;
                indexData.location = data.mainLocation;
            } else {
                // if (error.message.toLowerCase().includes("rate limit")) {
                console.log("pausing for rate limit");
                await pause(60);
            }
        }

        writeDataObjectFile(indexData, indexFileName);
        previousItemNumber = fileNumber;
    }
}

function pause(seconds) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

async function go() {
    await indexItemsIn("/Users/Shared/projects/antiqwiki/data/content/s1");
    await indexItemsIn("/Users/Shared/projects/antiqwiki/data/content/s2");
    await indexItemsIn("/Users/Shared/projects/antiqwiki/data/content/s3");
    await indexItemsIn("/Users/Shared/projects/antiqwiki/data/content/s4");
    await indexItemsIn("/Users/Shared/projects/antiqwiki/data/content/s5");
    await indexItemsIn("/Users/Shared/projects/antiqwiki/data/content/s6");
    await indexItemsIn("/Users/Shared/projects/antiqwiki/data/content/s7");
}

go();