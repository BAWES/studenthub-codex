import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const storyActivityItemSchema = z.object({
  story_activity_uuid: z.string(),
  story_uuid: z.string(),
  staff_id: z.number().int().nullable(),
  activity_time_spent: z.number().int().nullable(),
  activity_status: z.number().int(),
  activity_created_at: z.string().nullable(),
  activity_last_updated_at: z.string().nullable(),
});

export type StoryActivityItem = z.output<typeof storyActivityItemSchema>;

export const listStoryActivitiesResultSchema = z.object({
  activities: z.array(storyActivityItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().min(1).max(100),
  totalPages: z.number().int().nonnegative(),
});

export type ListStoryActivitiesResult = z.output<typeof listStoryActivitiesResultSchema>;

export const logStoryActivityResultSchema = z.object({
  story_activity_uuid: z.string(),
  story_uuid: z.string(),
  activity_status: z.number().int(),
});

export type LogStoryActivityResult = z.output<typeof logStoryActivityResultSchema>;

export const updateStoryActivityResultSchema = z.object({
  story_activity_uuid: z.string(),
  activity_status: z.number().int(),
  activity_time_spent: z.number().int().nullable(),
});

export type UpdateStoryActivityResult = z.output<typeof updateStoryActivityResultSchema>;
