import { z } from "zod";

export const listTagsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
});

export const getTagSchema = z.object({
  tagId: z.coerce.number().int().positive("Tag ID is required"),
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

export type ListTagsInput = z.input<typeof listTagsSchema>;
export type GetTagInput = z.input<typeof getTagSchema>;
export type CreateTagInput = z.input<typeof createTagSchema>;
export type UpdateTagInput = z.input<typeof updateTagSchema>;
export type DeleteTagInput = z.input<typeof deleteTagSchema>;

export type TagItem = { tag_id: number; tag: string; created_at: Date | null; updated_at: Date | null };
export type ListTagsResult = { tags: TagItem[]; total: number; page: number; limit: number; totalPages: number };
