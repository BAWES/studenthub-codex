import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas
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
// Types
// ---------------------------------------------------------------------------

export type ListScheduleInput = z.input<typeof listScheduleSchema>;
export type GetScheduleItemInput = z.input<typeof getScheduleItemSchema>;
export type UpdateScheduleStatusInput = z.input<typeof updateScheduleStatusSchema>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const scheduleItemOutputSchema = z.object({
  cwd_uuid: z.string(),
  date: z.date(),
  start_time: z.date(),
  end_time: z.date().nullable(),
  total_time: z.number().nullable(),
  status: z.number().nullable(),
  store_name: z.string().nullable(),
  company_name: z.string().nullable(),
});

export const scheduleStatusResultOutputSchema = z.object({
  cwd_uuid: z.string(),
  status: z.number().int(),
});

export const scheduleDetailOutputSchema = z.object({
  cwd_uuid: z.string(),
  date: z.date(),
  start_time: z.date(),
  end_time: z.date().nullable(),
  total_time: z.number().nullable(),
  status: z.number().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
  store: z
    .object({
      store_name: z.string().nullable(),
      company: z
        .object({
          company_name: z.string().nullable(),
        })
        .nullable(),
    })
    .nullable(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ScheduleItem = z.output<typeof scheduleItemOutputSchema>;

export type ScheduleStatusResult = z.output<typeof scheduleStatusResultOutputSchema>;

export type ScheduleDetail = z.output<typeof scheduleDetailOutputSchema>;
