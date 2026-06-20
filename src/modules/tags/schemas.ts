import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const tagItemSchema = z.object({
  tag_id: z.number(),
  tag: z.string(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

export type TagItem = z.output<typeof tagItemSchema>;

export const listTagsResultSchema = z.object({
  tags: z.array(tagItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().min(1).max(100),
  totalPages: z.number().int().nonnegative(),
});

export type ListTagsResult = z.output<typeof listTagsResultSchema>;
