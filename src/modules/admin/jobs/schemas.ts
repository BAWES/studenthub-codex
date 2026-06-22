import { z } from "zod";

// ---------------------------------------------------------------------------
// Admin job listing schemas
// ---------------------------------------------------------------------------

export const listAdminJobsSchema = z.object({
  search: z.string().optional(),
  status: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
});

export const adminJobItemSchema = z.object({
  job_uuid: z.string(),
  position: z.string(),
  position_ar: z.string().nullable(),
  description: z.string().nullable(),
  status: z.boolean().nullable(),
  hours_per_day: z.number().nullable(),
  compensation_type: z.string().nullable(),
  compensation_amount: z.string().nullable(),
  area_uuid: z.string().nullable(),
  request_uuid: z.string(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

export const listAdminJobsResultSchema = z.object({
  jobs: z.array(adminJobItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export type ListAdminJobsInput = z.input<typeof listAdminJobsSchema>;
export type AdminJobItem = z.output<typeof adminJobItemSchema>;
export type ListAdminJobsResult = z.output<typeof listAdminJobsResultSchema>;
