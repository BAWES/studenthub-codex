import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for src/modules/events actions
// ---------------------------------------------------------------------------

export const listActivityEventsSchema = z.object({
  requestUuid: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});
export const getActivityEventSchema = z.object({
  id: z.string().min(1, "Invalid activity event ID"),
});
export type ListActivityEventsParams = z.input<typeof listActivityEventsSchema>;
export type GetActivityEventParams = z.input<typeof getActivityEventSchema>;
// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const activityEventItemSchema = z.object({
  activity_uuid: z.string(),
  request_uuid: z.string(),
  activity_detail: z.string(),
  staff_name: z.string().nullable(),
  activity_created_datetime: z.date().nullable(),
  activity_updated_datetime: z.date().nullable(),
});

export const listActivityEventsResultSchema = z.object({
  events: z.array(activityEventItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

// ---------------------------------------------------------------------------
// Types derived from output schemas
// ---------------------------------------------------------------------------

export type ActivityEventItem = z.output<typeof activityEventItemSchema>;
export type ListActivityEventsResult = z.output<typeof listActivityEventsResultSchema>;
