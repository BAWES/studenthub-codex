import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for src/modules/candidates/working-hours actions
// ---------------------------------------------------------------------------

export const listCandidateWorkingHoursSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
  date: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});
export const getCandidateWorkingHourSchema = z.object({
  uuid: z.string().min(1, "Working hour UUID is required"),
});
export type ListCandidateWorkingHoursParams = z.input<
  typeof listCandidateWorkingHoursSchema
>;
export type GetCandidateWorkingHourParams = z.input<
  typeof getCandidateWorkingHourSchema
>;

export const listWorkLogFeedbackSchema = z.object({
  candidate_id: z.coerce.number().int().positive().optional(),
  status: z.coerce.number().int().min(0).max(2).optional(),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format").optional(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format").optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});
export const getWorkLogFeedbackSchema = z.object({
  uuid: z.string().min(1, "Work log feedback UUID is required"),
});
export type ListWorkLogFeedbackParams = z.input<typeof listWorkLogFeedbackSchema>;
export type GetWorkLogFeedbackParams = z.input<typeof getWorkLogFeedbackSchema>;

// ---------------------------------------------------------------------------
// Output schemas — validate response shapes at runtime
// ---------------------------------------------------------------------------

export const candidateWorkingHourItemSchema = z.object({
  candidate_working_hour_uuid: z.string(),
  candidate_id: z.number().nullable(),
  store_id: z.number().nullable(),
  date: z.string().nullable(),
  start_time: z.string().nullable(),
  end_time: z.string().nullable(),
  total_time: z.number().nullable(),
  status: z.number().nullable(),
  via: z.string().nullable(),
  note: z.string().nullable(),
  start_location_lat: z.number().nullable(),
  start_location_long: z.number().nullable(),
  end_location_lat: z.number().nullable(),
  end_location_long: z.number().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export type CandidateWorkingHourItem = z.output<typeof candidateWorkingHourItemSchema>;
export const candidateWorkingHourDetailSchema =
  candidateWorkingHourItemSchema.nullable();
export type CandidateWorkingHourDetail = z.output<
  typeof candidateWorkingHourDetailSchema
>;

export const listCandidateWorkingHoursResultSchema = z.object({
  items: z.array(candidateWorkingHourItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type ListCandidateWorkingHoursResult = z.output<typeof listCandidateWorkingHoursResultSchema>;

export const workLogFeedbackItemSchema = z.object({
  cwlf_uuid: z.string(),
  candidate_id: z.number(),
  store_id: z.number(),
  company_id: z.number(),
  date: z.date(),
  candidate_working_hour_uuid: z.string().nullable(),
  status: z.number().nullable(),
  note: z.string().nullable(),
  reason: z.string().nullable(),
  is_public: z.boolean().nullable(),
  rating: z.boolean().nullable(),
  created_by: z.string().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

export type WorkLogFeedbackItem = z.output<typeof workLogFeedbackItemSchema>;

export const listWorkLogFeedbackResultSchema = z.object({
  workLogFeedbacks: z.array(workLogFeedbackItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type ListWorkLogFeedbackResult = z.output<typeof listWorkLogFeedbackResultSchema>;
