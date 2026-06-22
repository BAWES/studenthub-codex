import { z } from "zod";

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for ProfileMetrics returned by getCandidateProfileDetail.
 */
export const profileMetricsSchema = z.object({
  experienceCount: z.number().int().nonnegative(),
  educationCount: z.number().int().nonnegative(),
  skillCount: z.number().int().nonnegative(),
  certificationCount: z.number().int().nonnegative(),
  languageCount: z.number().int().nonnegative(),
  applicationCount: z.number().int().nonnegative(),
});

/**
 * Schema for the combined result of getCandidateProfileDetail.
 * `detail` is validated separately by candidateProfileOutputSchema in the
 * parent candidate route — here we accept it as any so the schema stays
 * focused on the profile/actions contract.
 */
export const getCandidateProfileDetailResultSchema = z.object({
  detail: z.any(),
  metrics: profileMetricsSchema,
});

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

export type ProfileMetrics = z.output<typeof profileMetricsSchema>;
export type GetCandidateProfileDetailResult = z.output<
  typeof getCandidateProfileDetailResultSchema
>;
