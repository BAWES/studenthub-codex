import { z } from "zod";

export const listTagsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
});

export const createTagSchema = z.object({
  tag: z.string().min(1, "Tag name is required").max(128),
});

export const updateTagSchema = z.object({
  tagId: z.coerce.number().int().positive("Tag ID is required"),
  tag: z.string().min(1, "Tag name is required").max(128),
});

export const deleteTagSchema = z.object({
  tagId: z.coerce.number().int().positive("Tag ID is required"),
});

export const tagItemSchema = z.object({
  tag_id: z.number().int().positive(),
  tag: z.string().min(1),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

export const listTagsResultSchema = z.object({
  tags: z.array(tagItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export const tagActionResponseSchema = z.object({
  operation: z.string().min(1),
  message: z.string().min(1),
});

export type ListTagsInput = z.input<typeof listTagsSchema>;
export type CreateTagInput = z.input<typeof createTagSchema>;
export type UpdateTagInput = z.input<typeof updateTagSchema>;
export type DeleteTagInput = z.input<typeof deleteTagSchema>;

export type TagItem = z.output<typeof tagItemSchema>;
export type ListTagsResult = z.output<typeof listTagsResultSchema>;
export type TagActionResponse = z.output<typeof tagActionResponseSchema>;
