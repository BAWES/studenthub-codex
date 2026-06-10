import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for candidate/schedule actions
// ---------------------------------------------------------------------------
// Move these OUT of actions.ts so the "use server" file only exports async
// functions — Next.js requires this for "use server" files.
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

export type ScheduleItem = {
  cwd_uuid: string;
  date: Date;
  start_time: Date;
  end_time: Date | null;
  total_time: number | null;
  status: number | null;
  store_name: string | null;
  company_name: string | null;
};

export type ScheduleStatusResult = {
  cwd_uuid: string;
  status: number;
};

/**
 * Rich detail type with nested store/company, matching WorkingDateDetail shape.
 */
export type ScheduleDetail = {
  cwd_uuid: string;
  date: Date;
  start_time: Date;
  end_time: Date | null;
  total_time: number | null;
  status: number | null;
  created_at: Date | null;
  updated_at: Date | null;
  store: {
    store_name: string | null;
    company: { company_name: string | null } | null;
  } | null;
};
