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
export type JobListItem = {
  job_uuid: string;
  position: string;
  position_ar: string | null;
  description: string | null;
  hours_per_day: number | null;
  days_per_week: boolean | null;
  status: boolean | null;
  area_uuid: string | null;
  request_uuid: string;
  created_at: Date | null;
  updated_at: Date | null;
};
export type JobDetail = JobListItem & {
  description_ar: string | null;
  compensation_type: string | null;
  compensation_amount: string | null;
  compensation_description: string | null;
  compensation_description_ar: string | null;
  min_age: number | null;
  max_age: number | null;
  gender: boolean | null;
  available_from: Date | null;
  available_to: Date | null;
};
export type ListJobsResult = {
  jobs: JobListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

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
