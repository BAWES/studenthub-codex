import { z } from "zod";

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

export const listJobsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
});

// ---------------------------------------------------------------------------
// Item schemas
// ---------------------------------------------------------------------------

export const jobItemSchema = z.object({
  job_uuid: z.string().min(1),
  story_uuid: z.string().min(1),
  request_uuid: z.string().min(1),
  area_uuid: z.string().nullable(),
  position: z.string().min(1),
  position_ar: z.string().nullable(),
  hours_per_day: z.number().int().nullable(),
  days_per_week: z.boolean().nullable(),
  compensation_type: z.string().nullable(),
  compensation_amount: z.string().nullable(),
  min_age: z.number().int().nullable(),
  max_age: z.number().int().nullable(),
  gender: z.boolean().nullable(),
  available_from: z.date().nullable(),
  available_to: z.date().nullable(),
  status: z.boolean().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

// ---------------------------------------------------------------------------
// Result schemas
// ---------------------------------------------------------------------------

export const listJobsResultSchema = z.object({
  jobs: z.array(jobItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export const jobActionResponseSchema = z.object({
  operation: z.string().min(1),
  message: z.string().min(1),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListJobsInput = z.input<typeof listJobsSchema>;
export type JobItem = z.output<typeof jobItemSchema>;
export type ListJobsResult = z.output<typeof listJobsResultSchema>;
export type JobActionResponse = z.output<typeof jobActionResponseSchema>;
