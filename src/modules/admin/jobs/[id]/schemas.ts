import { z } from "zod";

// ---------------------------------------------------------------------------
// Job detail schemas — single-job detail/edit view
// ---------------------------------------------------------------------------

/**
 * Input schema for getJob.
 */
export const getJobSchema = z.object({
  jobUuid: z.string().min(1, "Job UUID is required"),
});

/**
 * Schema for a single job item in detail response.
 */
export const jobDetailItemSchema = z.object({
  job_uuid: z.string(),
  position: z.string(),
  position_ar: z.string().nullable(),
  description: z.string().nullable(),
  description_ar: z.string().nullable(),
  status: z.boolean().nullable(),
  hours_per_day: z.number().nullable(),
  days_per_week: z.boolean().nullable(),
  compensation_type: z.string().nullable(),
  compensation_amount: z.string().nullable(),
  compensation_description: z.string().nullable(),
  compensation_description_ar: z.string().nullable(),
  min_age: z.number().nullable(),
  max_age: z.number().nullable(),
  gender: z.boolean().nullable(),
  available_from: z.date().nullable(),
  available_to: z.date().nullable(),
  area_uuid: z.string().nullable(),
  request_uuid: z.string(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
  deleted_at: z.date().nullable(),
});

/**
 * Output schema for getJob.
 */
export const getJobResultSchema = z.object({
  job: jobDetailItemSchema.nullable(),
});

// ---------------------------------------------------------------------------
// Exported types
// ---------------------------------------------------------------------------

export type JobDetailItem = z.output<typeof jobDetailItemSchema>;
export type GetJobResult = z.output<typeof getJobResultSchema>;
export type GetJobInput = z.input<typeof getJobSchema>;
