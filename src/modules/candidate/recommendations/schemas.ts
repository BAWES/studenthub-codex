import { z } from "zod";

// ---------------------------------------------------------------------------
// Candidate Recommendations — output validation schemas
// ---------------------------------------------------------------------------

export const recommendationStatusSchema = z.enum(["pending", "approved", "declined", "expired"]);
export type RecommendationStatus = z.output<typeof recommendationStatusSchema>;

export const recommendationItemSchema = z.object({
  recommendation_uuid: z.string(),
  recommender_name: z.string(),
  recommender_email: z.string(),
  recommender_relation: z.string(),
  status: recommendationStatusSchema,
  message: z.string().nullable(),
  rating: z.number().min(1).max(5).nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type RecommendationItem = z.output<typeof recommendationItemSchema>;

export const listRecommendationsResultSchema = z.object({
  recommendations: z.array(recommendationItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});
export type ListRecommendationsResult = z.output<typeof listRecommendationsResultSchema>;

export const recommendationActionResultSchema = z.object({
  success: z.boolean(),
  recommendation_uuid: z.string().optional(),
  error: z.string().optional(),
});
export type RecommendationActionResult = z.output<typeof recommendationActionResultSchema>;

export const recommendationDetailSchema = z.object({
  recommendation_uuid: z.string(),
  recommender_name: z.string(),
  recommender_email: z.string(),
  recommender_phone: z.string().nullable(),
  recommender_relation: z.string(),
  recommender_company: z.string().nullable(),
  status: recommendationStatusSchema,
  message: z.string().nullable(),
  rating: z.number().min(1).max(5).nullable(),
  feedback: z.string().nullable(),
  candidate_name: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type RecommendationDetail = z.output<typeof recommendationDetailSchema>;
