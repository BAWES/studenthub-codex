import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

export const listWorkLogsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  date: z.string().optional(),
});

export const getWorkLogDetailSchema = z.object({
  workLogUuid: z.string().min(1, "Work log UUID is required"),
});

export const submitWorkLogSchema = z.object({
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().optional(),
  totalTime: z.coerce.number().int().optional(),
  note: z.string().optional(),
  storeId: z.coerce.number().int().optional(),
});

export const updateWorkLogStatusSchema = z.object({
  workLogUuid: z.string().min(1, "Work log UUID is required"),
  status: z.coerce.number().int().min(0, "Status must be 0 or greater"),
});

// ---------------------------------------------------------------------------
// Output validation — Zod schemas for server action return types
// ---------------------------------------------------------------------------

/**
 * A single work log item returned by listWorkLogs and getWorkLogDetail.
 * Matches the WorkLogItem type shape with coerced nullable dates.
 */
export const workLogItemOutputSchema = z.object({
  candidate_working_hour_uuid: z.string(),
  date: z.date().nullable(),
  start_time: z.date().nullable(),
  end_time: z.date().nullable(),
  total_time: z.number().nullable(),
  status: z.number().nullable(),
  via: z.string().nullable(),
  note: z.string().nullable(),
  store_name: z.string().nullable(),
  company_name: z.string().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

/**
 * A single work log detail (WorkLogItem + location fields).
 */
export const workLogDetailOutputSchema = workLogItemOutputSchema.extend({
  start_location_lat: z.number().nullable(),
  start_location_long: z.number().nullable(),
  end_location_lat: z.number().nullable(),
  end_location_long: z.number().nullable(),
  store_location: z.string().nullable(),
});

/**
 * Paginated list result (listWorkLogs return).
 */
export const listWorkLogsResultOutputSchema = z.object({
  items: z.array(workLogItemOutputSchema),
  total: z.number().nonnegative(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

/**
 * Submit work log result — discriminated union.
 */
export const submitWorkLogResultOutputSchema = z.discriminatedUnion("operation", [
  z.object({
    operation: z.literal("success"),
    message: z.string(),
    workLog: workLogItemOutputSchema.optional(),
  }),
  z.object({
    operation: z.literal("error"),
    message: z.string(),
    workLog: workLogItemOutputSchema.optional(),
  }),
]);

/**
 * Update work log status result — discriminated union.
 */
export const updateWorkLogStatusResultOutputSchema = z.discriminatedUnion("operation", [
  z.object({
    operation: z.literal("success"),
    message: z.string(),
    workLog: workLogItemOutputSchema.optional(),
  }),
  z.object({
    operation: z.literal("error"),
    message: z.string(),
    workLog: workLogItemOutputSchema.optional(),
  }),
]);

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

export type WorkLogItem = z.output<typeof workLogItemOutputSchema>;
export type WorkLogDetail = z.output<typeof workLogDetailOutputSchema>;
export type ListWorkLogsResult = z.output<typeof listWorkLogsResultOutputSchema>;
export type SubmitWorkLogResult = z.output<typeof submitWorkLogResultOutputSchema>;
export type UpdateWorkLogStatusResult = z.output<typeof updateWorkLogStatusResultOutputSchema>;
