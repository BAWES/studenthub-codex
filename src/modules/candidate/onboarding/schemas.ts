import { z } from "zod";

// ---------------------------------------------------------------------------
// Candidate Onboarding — output validation schemas
// ---------------------------------------------------------------------------

export const onboardingStatusSchema = z.enum(["not-started", "in-progress", "completed", "on-hold"]);
export type OnboardingStatus = z.output<typeof onboardingStatusSchema>;

export const onboardingStepItemSchema = z.object({
  step_uuid: z.string(),
  step_name: z.string(),
  step_order: z.number().int().nonnegative(),
  status: onboardingStatusSchema,
  required: z.boolean(),
  description: z.string().nullable(),
  completed_at: z.string().nullable(),
});
export type OnboardingStepItem = z.output<typeof onboardingStepItemSchema>;

export const onboardingItemSchema = z.object({
  onboarding_uuid: z.string(),
  candidate_name: z.string(),
  candidate_email: z.string(),
  status: onboardingStatusSchema,
  steps: z.array(onboardingStepItemSchema),
  started_at: z.string().nullable(),
  completed_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type OnboardingItem = z.output<typeof onboardingItemSchema>;

export const listOnboardingResultSchema = z.object({
  items: z.array(onboardingItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});
export type ListOnboardingResult = z.output<typeof listOnboardingResultSchema>;

export const onboardingActionResultSchema = z.object({
  success: z.boolean(),
  onboarding_uuid: z.string().optional(),
  error: z.string().optional(),
});
export type OnboardingActionResult = z.output<typeof onboardingActionResultSchema>;

export const onboardingDetailSchema = z.object({
  onboarding_uuid: z.string(),
  candidate_name: z.string(),
  candidate_email: z.string(),
  candidate_phone: z.string().nullable(),
  status: onboardingStatusSchema,
  steps: z.array(onboardingStepItemSchema),
  documents_required: z.array(z.string()),
  documents_uploaded: z.array(z.string()),
  started_at: z.string().nullable(),
  completed_at: z.string().nullable(),
  notes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type OnboardingDetail = z.output<typeof onboardingDetailSchema>;
