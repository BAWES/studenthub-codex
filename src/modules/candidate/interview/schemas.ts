import { z } from "zod";

// ---------------------------------------------------------------------------
// Candidate Interview — output validation schemas
// ---------------------------------------------------------------------------

export const interviewTypeSchema = z.enum(["phone", "video", "in-person", "technical", "hr"]);
export type InterviewType = z.output<typeof interviewTypeSchema>;

export const interviewStatusSchema = z.enum(["scheduled", "completed", "cancelled", "rescheduled", "no-show"]);
export type InterviewStatus = z.output<typeof interviewStatusSchema>;

export const interviewItemSchema = z.object({
  interview_uuid: z.string(),
  interview_type: interviewTypeSchema,
  status: interviewStatusSchema,
  scheduled_at: z.string(),
  duration_minutes: z.number().int().positive(),
  interviewer_name: z.string().nullable(),
  notes: z.string().nullable(),
  feedback: z.string().nullable(),
  rating: z.number().min(1).max(5).nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type InterviewItem = z.output<typeof interviewItemSchema>;

export const listInterviewsResultSchema = z.object({
  interviews: z.array(interviewItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});
export type ListInterviewsResult = z.output<typeof listInterviewsResultSchema>;

export const interviewActionResultSchema = z.object({
  success: z.boolean(),
  interview_uuid: z.string().optional(),
  error: z.string().optional(),
});
export type InterviewActionResult = z.output<typeof interviewActionResultSchema>;

export const interviewDetailSchema = z.object({
  interview_uuid: z.string(),
  interview_type: interviewTypeSchema,
  status: interviewStatusSchema,
  scheduled_at: z.string(),
  duration_minutes: z.number().int().positive(),
  interviewer_name: z.string().nullable(),
  interviewer_email: z.string().nullable(),
  location: z.string().nullable(),
  meeting_link: z.string().nullable(),
  notes: z.string().nullable(),
  feedback: z.string().nullable(),
  rating: z.number().min(1).max(5).nullable(),
  candidate_name: z.string(),
  candidate_email: z.string(),
  job_title: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type InterviewDetail = z.output<typeof interviewDetailSchema>;
