import { defineCollection, z } from "astro:content";

const examples = defineCollection({
    type: "content",
    schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        visible: z.boolean().default(false),
    }),
});

export const collections = { examples };
