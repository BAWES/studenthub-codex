import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const cronLogItemSchema = z.object({
  id: z.number(),
  task: z.string(),
  last_ran_at: z.date().nullable(),
  last_output: z.string().nullable(),
});

export type CronLogItem = z.output<typeof cronLogItemSchema>;

export const listCronLogsResultSchema = z.object({
  cronLogs: z.array(cronLogItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().min(1).max(100),
  totalPages: z.number().int().nonnegative(),
});

export type ListCronLogsResult = z.output<typeof listCronLogsResultSchema>;

export const getCronLogResultSchema = cronLogItemSchema.nullable();

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

export type ListCronLogsInput = z.input<typeof listCronLogsSchema>;
export type GetCronLogInput = z.input<typeof getCronLogSchema>;
