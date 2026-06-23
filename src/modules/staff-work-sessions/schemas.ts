import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const staffWorkSessionSchema = z.object({
  work_session_uuid: z.string(),
  staff_id: z.number().nullable(),
  total_minutes: z.number().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type StaffWorkSession = z.output<typeof staffWorkSessionSchema>;

export const listStaffWorkSessionsResultSchema = z.object({
  sessions: z.array(staffWorkSessionSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().min(1).max(100),
  totalPages: z.number().int().nonnegative(),
});

export type ListStaffWorkSessionsResult = z.output<
  typeof listStaffWorkSessionsResultSchema
>;

export const createStaffWorkSessionResultSchema = z.object({
  work_session_uuid: z.string(),
  staff_id: z.number().nullable(),
  total_minutes: z.number().nullable(),
});

export type CreateStaffWorkSessionResult = z.output<
  typeof createStaffWorkSessionResultSchema
>;
