import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for candidate/experience/[experienceId] actions
// ---------------------------------------------------------------------------

/**
 * Validate a numeric experience ID for get/delete operations.
 */
export const getExperienceEntrySchema = z.object({
  experienceId: z.coerce.number().int().positive("Experience ID is required"),
});

/**
 * Validate update params — re-uses the parent `updateExperienceSchema` shape
 * but requires experienceId as the first positional param for the colocated
 * action signature.
 */
export const updateExperienceEntrySchema = z.object({
  experienceId: z.coerce.number().int().positive("Experience ID is required"),
  experience: z
    .string()
    .min(1, "Position/title is required")
    .max(128, "Position/title must be 128 characters or fewer")
    .transform((v) => v.trim()),
  employer: z
    .string()
    .max(255, "Employer must be 255 characters or fewer")
    .optional()
    .default("")
    .transform((v) => v.trim()),
  startYear: z.coerce.number().int().min(1900).max(2100).optional(),
  endYear: z.coerce.number().int().min(1900).max(2100).optional(),
});

/**
 * Validate delete params.
 */
export const deleteExperienceEntrySchema = z.object({
  experienceId: z.coerce.number().int().positive("Experience ID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GetExperienceEntryInput = z.input<typeof getExperienceEntrySchema>;
export type UpdateExperienceEntryInput = z.input<typeof updateExperienceEntrySchema>;
export type DeleteExperienceEntryInput = z.input<typeof deleteExperienceEntrySchema>;

export type ExperienceEntryResponse = {
  success: boolean;
  data?: unknown;
  error?: string;
};
