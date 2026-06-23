import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const storyListItemSchema = z.object({
  story_uuid: z.string(),
  request_uuid: z.string(),
  suggestion_uuid: z.string().nullable(),
  staff_id: z.number().int().nullable(),
  number_of_employees: z.number().int().nullable(),
  story_status: z.number().int(),
  is_old: z.boolean().nullable(),
  story_time_spent: z.number().int().nullable(),
  story_created_at: z.string().nullable(),
  story_last_updated_at: z.string().nullable(),
});

export type StoryListItem = z.output<typeof storyListItemSchema>;

export const listStoriesResultSchema = z.object({
  stories: z.array(storyListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().min(1).max(100),
  totalPages: z.number().int().nonnegative(),
});

export type ListStoriesResult = z.output<typeof listStoriesResultSchema>;

export const assignStoryResultSchema = z.object({
  story_uuid: z.string(),
  staff_id: z.number().int(),
});

export type AssignStoryResult = z.output<typeof assignStoryResultSchema>;

export const updateStoryStatusResultSchema = z.object({
  story_uuid: z.string(),
  story_status: z.number().int(),
});

export type UpdateStoryStatusResult = z.output<typeof updateStoryStatusResultSchema>;
