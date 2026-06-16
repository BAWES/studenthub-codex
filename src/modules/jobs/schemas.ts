import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for src/modules/jobs actions
// ---------------------------------------------------------------------------

/**
 * Coerce a boolean-like string/enum value to a real boolean.
 * Handles "true"/"false"/"1"/"0" — mirrors the certificate action pattern.
 */
const coerceBool = z
  .enum(["true", "false", "1", "0"])
  .transform((v) => v === "true" || v === "1");

export const listJobsSchema = z.object({
  status: coerceBool.optional(),
  companyId: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});
export const getJobSchema = z.object({
  jobUuid: z.string().min(1, "Job UUID is required"),
});
export type ListJobsParams = z.input<typeof listJobsSchema>;
export type GetJobParams = z.input<typeof getJobSchema>;
export type JobListItem = z.output<typeof jobListItemSchema>;
export type JobDetail = z.output<typeof jobDetailSchema>;
export type ListJobsResult = z.output<typeof listJobsResultSchema>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const jobListItemSchema = z.object({
  job_uuid: z.string(),
  position: z.string(),
  position_ar: z.string().nullable(),
  description: z.string().nullable(),
  hours_per_day: z.number().nullable(),
  days_per_week: z.boolean().nullable(),
  status: z.boolean().nullable(),
  area_uuid: z.string().nullable(),
  request_uuid: z.string(),
  created_at: z.union([z.date(), z.string()]).nullable(),
  updated_at: z.union([z.date(), z.string()]).nullable(),
});

export const jobDetailSchema = jobListItemSchema.extend({
  description_ar: z.string().nullable(),
  compensation_type: z.string().nullable(),
  compensation_amount: z.string().nullable(),
  compensation_description: z.string().nullable(),
  compensation_description_ar: z.string().nullable(),
  min_age: z.number().nullable(),
  max_age: z.number().nullable(),
  gender: z.boolean().nullable(),
  available_from: z.union([z.date(), z.string()]).nullable(),
  available_to: z.union([z.date(), z.string()]).nullable(),
});

export const listJobsResultSchema = z.object({
  jobs: z.array(jobListItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});
