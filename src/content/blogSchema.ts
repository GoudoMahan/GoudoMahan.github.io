import { z } from "astro/zod";

const distinctStrings = z
  .array(z.string())
  .refine((items) => new Set(items).size === items.length, "不得包含重复项");

export const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  updated: z.coerce.date().optional(),
  image: z.string().optional(),
  badge: z.string().optional(),
  draft: z.boolean().default(false),
  categories: distinctStrings.optional(),
  tags: distinctStrings.optional(),
});
