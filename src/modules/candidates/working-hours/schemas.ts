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
export type CandidateWorkingHourItem = {
  candidate_working_hour_uuid: string;
  candidate_id: number | null;
  store_id: number | null;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  total_time: number | null;
  status: number | null;
  via: string | null;
  note: string | null;
  start_location_lat: number | null;
  start_location_long: number | null;
  end_location_lat: number | null;
  end_location_long: number | null;
  created_at: string | null;
  updated_at: string | null;
};
export type CandidateWorkingHourDetail = CandidateWorkingHourItem | null;
export type ListCandidateWorkingHoursResult = {
  items: CandidateWorkingHourItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
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
export type WorkLogFeedbackItem = {
  cwlf_uuid: string;
  candidate_id: number;
  store_id: number;
  company_id: number;
  date: Date;
  candidate_working_hour_uuid: string | null;
  status: number | null;
  note: string | null;
  reason: string | null;
  is_public: boolean | null;
  rating: boolean | null;
  created_by: string | null;
  created_at: Date | null;
  updated_at: Date | null;
};
export type ListWorkLogFeedbackResult = {
  workLogFeedbacks: WorkLogFeedbackItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
