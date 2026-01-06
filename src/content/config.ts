import { defineCollection, z } from "astro:content";
import { EXAMPLE_CATEGORIES_WITH_FALLBACK, UNCATEGORIZED } from "../types/exampleCategories";

const examples = defineCollection({
    type: "content",
    schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        visible: z.boolean().default(false),
        approved: z.boolean().default(false),
        ord: z.number().default(0),
        category: z.enum(EXAMPLE_CATEGORIES_WITH_FALLBACK).default(UNCATEGORIZED),
    }),
});

export const collections = { examples };
