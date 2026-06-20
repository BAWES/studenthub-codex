import { z } from "zod";

export const listStoriesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
});

export const storyItemSchema = z.object({
  story_uuid: z.string().min(1),
  request_uuid: z.string().min(1),
  suggestion_uuid: z.string().nullable(),
  staff_id: z.number().int().nullable(),
  number_of_employees: z.number().int().nullable(),
  story_status: z.number().int(),
  is_old: z.boolean().nullable(),
  story_time_spent: z.number().int().nullable(),
  story_created_at: z.date().nullable(),
  story_last_updated_at: z.date().nullable(),
});

export const listStoriesResultSchema = z.object({
  stories: z.array(storyItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export const storyActionResponseSchema = z.object({
  operation: z.string().min(1),
  message: z.string().min(1),
});

export type ListStoriesInput = z.input<typeof listStoriesSchema>;
export type StoryItem = z.output<typeof storyItemSchema>;
export type ListStoriesResult = z.output<typeof listStoriesResultSchema>;
export type StoryActionResponse = z.output<typeof storyActionResponseSchema>;
