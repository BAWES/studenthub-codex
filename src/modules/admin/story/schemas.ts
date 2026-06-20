import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

export const listStorySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  search: z.string().optional(),
});

export const createStorySchema = z.object({
  requestUuid: z.string().min(1, "Request UUID is required"),
  staffId: z.coerce.number().int().positive().optional(),
  numberOfEmployees: z.coerce.number().int().min(1).optional(),
  storyStatus: z.coerce.number().int().default(0),
  isOld: z.coerce.boolean().optional(),
  storyTimeSpent: z.coerce.number().int().optional(),
});

export const updateStorySchema = z.object({
  storyUuid: z.string().min(1, "Story UUID is required"),
  staffId: z.coerce.number().int().positive().optional(),
  numberOfEmployees: z.coerce.number().int().min(1).optional(),
  storyStatus: z.coerce.number().int().default(0),
  isOld: z.coerce.boolean().optional(),
  storyTimeSpent: z.coerce.number().int().optional(),
});

export const deleteStorySchema = z.object({
  storyUuid: z.string().min(1, "Story UUID is required"),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const storyItemSchema = z.object({
  story_uuid: z.string().min(1),
  request_uuid: z.string().min(1),
  request_position_title: z.string().nullable(),
  staff_id: z.number().int().nullable(),
  staff_name: z.string().nullable(),
  number_of_employees: z.number().int().nullable(),
  story_status: z.number().int(),
  is_old: z.boolean().nullable(),
  story_time_spent: z.number().int().nullable(),
  story_created_at: z.date().nullable(),
  story_last_updated_at: z.date().nullable(),
});

export const listStoryResultSchema = z.object({
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

// ---------------------------------------------------------------------------
// Types derived from output schemas
// ---------------------------------------------------------------------------

export type StoryItem = z.output<typeof storyItemSchema>;
export type ListStoryResult = z.output<typeof listStoryResultSchema>;
export type StoryActionResponse = z.output<typeof storyActionResponseSchema>;

export type ListStoryInput = z.input<typeof listStorySchema>;
export type CreateStoryInput = z.input<typeof createStorySchema>;
export type UpdateStoryInput = z.input<typeof updateStorySchema>;
export type DeleteStoryInput = z.input<typeof deleteStorySchema>;
