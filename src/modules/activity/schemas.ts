import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for src/modules/activity actions
// ---------------------------------------------------------------------------

export const listActivitySchema = z.object({
  requestUuid: z.string().min(1).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
});
export const getActivitySchema = z.object({
  uuid: z.string().min(1, "Activity UUID is required"),
});
export type ListActivityParams = z.input<typeof listActivitySchema>;
export type GetActivityParams = z.input<typeof getActivitySchema>;
export type RequestActivityItem = {
  activity_uuid: string;
  request_uuid: string;
  staff_id: number | null;
  activity_detail: string;
  activity_created_datetime: string | null;
  activity_updated_datetime: string | null;
};
export type ListActivityResult = {
  activities: RequestActivityItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
