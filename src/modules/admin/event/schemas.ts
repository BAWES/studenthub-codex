import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for src/modules/admin/event actions
// ---------------------------------------------------------------------------

export const listEventsSchema = z.object({
  requestUuid: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});
export const getEventSchema = z.object({
  id: z.string().min(1, "Invalid event ID"),
});
export const getEventTimelineSchema = z.object({
  requestUuid: z.string().min(1, "Invalid request UUID"),
});
export const listActivityEventsSchema = listEventsSchema;
export type ListEventsParams = z.input<typeof listEventsSchema>;
export type GetEventParams = z.input<typeof getEventSchema>;
export type GetEventTimelineParams = z.input<typeof getEventTimelineSchema>;
export type EventItem = {
  activity_uuid: string;
  request_uuid: string;
  activity_detail: string;
  staff_name: string | null;
  activity_created_datetime: Date | null;
  activity_updated_datetime: Date | null;
};
export type ListEventsResult = {
  events: EventItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
export type TimelineEntry = {
  date: string;
  events: EventItem[];
};
