import { z } from "zod";

// ---------------------------------------------------------------------------
// Candidate Performance — output validation schemas
// ---------------------------------------------------------------------------

export const performanceReviewStatusSchema = z.enum(["draft", "submitted", "reviewed", "acknowledged"]);
export type PerformanceReviewStatus = z.output<typeof performanceReviewStatusSchema>;

export const performanceRatingSchema = z.object({
  criteria: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().nullable(),
});
export type PerformanceRating = z.output<typeof performanceRatingSchema>;

export const performanceReviewItemSchema = z.object({
  review_uuid: z.string(),
  review_period: z.string(),
  status: performanceReviewStatusSchema,
  reviewer_name: z.string(),
  overall_rating: z.number().min(1).max(5).nullable(),
  ratings: z.array(performanceRatingSchema),
  summary: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type PerformanceReviewItem = z.output<typeof performanceReviewItemSchema>;

export const listPerformanceReviewsResultSchema = z.object({
  reviews: z.array(performanceReviewItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});
export type ListPerformanceReviewsResult = z.output<typeof listPerformanceReviewsResultSchema>;

export const performanceGoalSchema = z.object({
  goal_uuid: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  target_date: z.string().nullable(),
  status: z.enum(["active", "achieved", "missed", "cancelled"]),
  progress_pct: z.number().min(0).max(100),
  created_at: z.string(),
  updated_at: z.string(),
});
export type PerformanceGoal = z.output<typeof performanceGoalSchema>;

export const performanceActionResultSchema = z.object({
  success: z.boolean(),
  review_uuid: z.string().optional(),
  error: z.string().optional(),
});
export type PerformanceActionResult = z.output<typeof performanceActionResultSchema>;

export const performanceDetailSchema = z.object({
  review_uuid: z.string(),
  review_period: z.string(),
  status: performanceReviewStatusSchema,
  reviewer_name: z.string(),
  reviewer_role: z.string().nullable(),
  overall_rating: z.number().min(1).max(5).nullable(),
  ratings: z.array(performanceRatingSchema),
  summary: z.string().nullable(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  goals: z.array(performanceGoalSchema),
  candidate_name: z.string(),
  candidate_role: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type PerformanceDetail = z.output<typeof performanceDetailSchema>;
