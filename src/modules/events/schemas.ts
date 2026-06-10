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
export type ActivityEventItem = {
  activity_uuid: string;
  request_uuid: string;
  activity_detail: string;
  staff_name: string | null;
  activity_created_datetime: Date | null;
  activity_updated_datetime: Date | null;
};
export type ListActivityEventsResult = {
  events: ActivityEventItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
