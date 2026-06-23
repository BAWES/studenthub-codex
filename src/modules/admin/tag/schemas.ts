import { z } from "zod";

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const tagListItemSchema = z.object({
  tag_id: z.number().int(),
  tag: z.string().min(1, "Tag name is required"),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

export const listTagsResultSchema = z.object({
  records: z.array(tagListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export const tagIdResultSchema = z.object({
  tag_id: z.number().int(),
});

// ---------------------------------------------------------------------------
// Types derived from output schemas
// ---------------------------------------------------------------------------

export type TagListItem = z.output<typeof tagListItemSchema>;
export type ListTagsResult = z.output<typeof listTagsResultSchema>;
export type TagIdResult = z.output<typeof tagIdResultSchema>;
