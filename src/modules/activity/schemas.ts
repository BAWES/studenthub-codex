import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

export const listActivitySchema = z.object({
  requestUuid: z.string().min(1).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const getActivitySchema = z.object({
  uuid: z.string().min(1, "Activity UUID is required"),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single request activity item.
 */
export const requestActivityItemSchema = z.object({
  activity_uuid: z.string(),
  request_uuid: z.string(),
  staff_id: z.number().int().nullable(),
  activity_detail: z.string(),
  activity_created_datetime: z.string().nullable(),
  activity_updated_datetime: z.string().nullable(),
});

/**
 * Schema for the listActivity response.
 */
export const listActivityResultSchema = z.object({
  activities: z.array(requestActivityItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListActivityParams = z.input<typeof listActivitySchema>;
export type GetActivityParams = z.input<typeof getActivitySchema>;
export type RequestActivityItem = z.output<typeof requestActivityItemSchema>;
export type ListActivityResult = z.output<typeof listActivityResultSchema>;
