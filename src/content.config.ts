import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const citationDate = z.union([z.string(), z.date(), z.number()]).transform((value) => {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
});

const sourceSchema = z.object({
  title: z.string(),
  publisher: z.string(),
  url: z.url(),
  date: citationDate.optional(),
  accessed: citationDate.optional(),
});

const attachmentSchema = z.object({
  title: z.string(),
  href: z.string().min(1),
  kind: z.enum(['report', 'data', 'appendix', 'other']),
  format: z.string(),
  size: z.string().optional(),
  description: z.string().optional(),
});

const researchSchema = z.object({
  title: z.string(),
  reportNumber: z.string().regex(/^YD-[A-Z]+-\d{4}-\d{3}$/).optional(),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  category: z.string(),
  tags: z.array(z.string()).default([]),
  authorId: z.string(),
  summary: z.string(),
  description: z.string().optional(),
  featured: z.boolean().default(false),
  related: z.array(z.string()).default([]),
  highlights: z.array(z.string()).max(5).default([]),
  attachments: z.array(attachmentSchema).default([]),
  sources: z.array(sourceSchema).default([]),
  draft: z.boolean().default(false),
}).superRefine((data, ctx) => {
  if (!data.draft && !data.reportNumber) {
    ctx.addIssue({ code: 'custom', path: ['reportNumber'], message: 'Published research requires a reportNumber.' });
  }
  if (!data.draft && data.sources.length === 0) {
    ctx.addIssue({ code: 'custom', path: ['sources'], message: 'Published research requires at least one source.' });
  }
});

const research = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/research' }),
  schema: researchSchema,
});

const authors = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/authors' }),
  schema: z.object({
    name: z.string(),
    type: z.enum(['Person', 'Organization']),
    role: z.string().optional(),
    bio: z.string(),
    url: z.url().optional(),
  }),
});

export const collections = { research, authors };
