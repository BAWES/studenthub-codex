import { z } from "zod";

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single work log feedback item.
 */
export const workLogFeedbackItemSchema = z.object({
  cwlf_uuid: z.string(),
  candidate_id: z.number().int().positive(),
  store_id: z.number().int().positive(),
  company_id: z.number().int().positive(),
  date: z.date(),
  candidate_working_hour_uuid: z.string().nullable(),
  status: z.number().int().nullable(),
  note: z.string().nullable(),
  reason: z.string().nullable(),
  is_public: z.boolean().nullable(),
  rating: z.boolean().nullable(),
  created_by: z.string().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

/**
 * Schema for the listWorkLogFeedback response.
 */
export const listWorkLogFeedbackResultSchema = z.object({
  workLogFeedbacks: z.array(workLogFeedbackItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Types derived from output schemas
// ---------------------------------------------------------------------------

export type WorkLogFeedbackItem = z.output<typeof workLogFeedbackItemSchema>;
export type ListWorkLogFeedbackResult = z.output<typeof listWorkLogFeedbackResultSchema>;

// ---------------------------------------------------------------------------
// Input types (derived from input schemas)
// ---------------------------------------------------------------------------

export type ListWorkLogFeedbackParams = z.input<typeof listWorkLogFeedbackSchema>;
export type GetWorkLogFeedbackParams = z.input<typeof getWorkLogFeedbackSchema>;
