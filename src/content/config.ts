import { z, defineCollection } from "astro:content";

const aiBlogSchema = z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.string().optional(),
    heroImage: z.string().optional(),
    badge: z.string().optional(),
    category: z.enum(["qa", "ai", "frontend", "backend", "software-engineering", "data", "cloud", "life-work-balance", "softskills"]),
    tags: z.array(z.string()).refine(items => new Set(items).size === items.length, {
        message: 'tags must be unique',
    }).optional(),
    series: z.string().optional(),
    seriesOrder: z.number().optional(),
});

export type AIBlogSchema = z.infer<typeof aiBlogSchema>;

const aiBlogSourcesSchema = z.object({
    postSlug: z.string(),
    sources: z.array(z.object({
        title: z.string(),
        url: z.string().url(),
        accessDate: z.string().optional(),
    })).min(1),
});

export type AIBlogSourcesSchema = z.infer<typeof aiBlogSourcesSchema>;

const aiBlogCollection = defineCollection({ schema: aiBlogSchema });
const aiBlogSourcesCollection = defineCollection({ schema: aiBlogSourcesSchema });

export const collections = {
    'ai-blog': aiBlogCollection,
    'ai-blog-sources': aiBlogSourcesCollection,
}
