import { z } from "zod";

// ---------------------------------------------------------------------------
// Tag Detail schemas — single-tag detail page
// ---------------------------------------------------------------------------

/**
 * Input schema for getTag.
 */
export const getTagSchema = z.object({
  tagId: z.coerce.number().int().positive("Tag ID is required"),
});

/**
 * Schema for a single tag item in detail response.
 */
export const tagItemSchema = z.object({
  tag_id: z.number().int().positive(),
  tag: z.string().min(1),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

/**
 * Output schema for getTag.
 */
export const getTagResultSchema = z.object({
  tag: tagItemSchema.nullable(),
});

// ---------------------------------------------------------------------------
// Exported types
// ---------------------------------------------------------------------------

export type TagItem = z.output<typeof tagItemSchema>;
export type GetTagResult = z.output<typeof getTagResultSchema>;
export type GetTagInput = z.input<typeof getTagSchema>;
