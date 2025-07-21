// src/content/config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ 
    pattern: '**/*.md', 
    base: './src/content',
    generateId: ({ entry }) => {
      // Convert "2022/Earth.md" to "2022/earth"
      return entry.replace(/\.md$/, '').toLowerCase()
    }
  }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string().optional(),
    pubDate: z.date(),
    collection: z.number().int(),
    layout: z.string().optional(),
    readingTime: z.number().positive().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  })
});

export const collections = { posts };