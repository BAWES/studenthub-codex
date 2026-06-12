import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas for candidate schedule module
// ---------------------------------------------------------------------------

export const listScheduleSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const getScheduleItemSchema = z.object({
  cwd_uuid: z.string().min(1, "Working date UUID is required"),
});

export const getScheduleDetailSchema = z.object({
  cwd_uuid: z.string().min(1, "Working date UUID is required"),
});

/** Valid working-date statuses for candidate self-service updates. */
const VALID_SCHEDULE_STATUSES = [0, 1, 2, 3] as const;

export const updateScheduleStatusSchema = z.object({
  cwd_uuid: z.string().min(1, "Working date UUID is required"),
  status: z
    .number({ required_error: "Status is required", invalid_type_error: "Status must be a number" })
    .int("Status must be an integer")
    .refine((s) => (VALID_SCHEDULE_STATUSES as readonly number[]).includes(s), {
      message: "Status must be one of: 0 (Pending), 1 (Confirmed), 2 (Cancelled), 3 (Completed)",
    }),
});

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export type ListScheduleInput = z.input<typeof listScheduleSchema>;
export type GetScheduleItemInput = z.input<typeof getScheduleItemSchema>;
export type UpdateScheduleStatusInput = z.input<typeof updateScheduleStatusSchema>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const scheduleItemSchema = z.object({
  cwd_uuid: z.string(),
  date: z.date(),
  start_time: z.date(),
  end_time: z.date().nullable(),
  total_time: z.number().int().nullable(),
  status: z.number().int().nullable(),
  store_name: z.string().nullable(),
  company_name: z.string().nullable(),
});

export const scheduleStatusResultSchema = z.object({
  cwd_uuid: z.string(),
  status: z.number().int(),
});

export const scheduleDetailStoreCompanySchema = z.object({
  company_name: z.string().nullable(),
});

export const scheduleDetailStoreSchema = z.object({
  store_name: z.string().nullable(),
  company: scheduleDetailStoreCompanySchema.nullable(),
});

export const scheduleDetailSchema = z.object({
  cwd_uuid: z.string(),
  date: z.date(),
  start_time: z.date(),
  end_time: z.date().nullable(),
  total_time: z.number().int().nullable(),
  status: z.number().int().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
  store: scheduleDetailStoreSchema.nullable(),
});

// ---------------------------------------------------------------------------
// Output types
// ---------------------------------------------------------------------------

export type ScheduleItem = z.output<typeof scheduleItemSchema>;
export type ScheduleStatusResult = z.output<typeof scheduleStatusResultSchema>;
export type ScheduleDetail = z.output<typeof scheduleDetailSchema>;
