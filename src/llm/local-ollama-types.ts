import { z } from "zod";

export const locationSchema = z.object({
    locationName: z.string(),
    locationType: z.string(),
});

export const storySynopsisSchema = z.object({
    summarySentence1: z.string(),
    summarySentence2: z.string(),
    storyCount: z.number(),
    storyTitle: z.string(),
    mainLocation: z.string().nullable(),
});

export const locationListSchema = z.array(locationSchema);
