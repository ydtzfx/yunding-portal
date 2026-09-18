import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const research = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/research' }),
  schema: z.object({
    title: z.string(), date: z.coerce.date(), updated: z.coerce.date().optional(),
    category: z.string(), tags: z.array(z.string()).default([]), author: z.string(),
    summary: z.string(), description: z.string().optional(), featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});
export const collections = { research };
