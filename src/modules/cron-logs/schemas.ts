import { z } from "zod";

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

export const listCronLogsSchema = z.object({
  task: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export const getCronLogSchema = z.object({
  id: z.number().int().positive(),
});

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single cron log item returned from list / get actions.
 */
export const cronLogItemSchema = z.object({
  id: z.number().int(),
  task: z.string(),
  last_ran_at: z.date().nullable(),
  last_output: z.string().nullable(),
});

/**
 * Schema for the listCronLogs response.
 */
export const listCronLogsResultSchema = z.object({
  cronLogs: z.array(cronLogItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

/**
 * Schema for getCronLog result (item or null).
 */
export const getCronLogResultSchema = z.object({
  cronLog: cronLogItemSchema.nullable(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListCronLogsInput = z.input<typeof listCronLogsSchema>;
export type GetCronLogInput = z.input<typeof getCronLogSchema>;

export type CronLogItem = z.output<typeof cronLogItemSchema>;
export type ListCronLogsResult = z.output<typeof listCronLogsResultSchema>;
export type GetCronLogResult = z.output<typeof getCronLogResultSchema>;
