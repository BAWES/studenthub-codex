import { z } from "zod";

// ---------------------------------------------------------------------------
// Input schemas for candidate/experience/[experienceId]/edit actions
// ---------------------------------------------------------------------------

/**
 * Validate update experience entry params.
 * Mirrors the parent updateExperienceEntrySchema shape since the edit action
 * accepts the same positional parameters and validates them before delegating.
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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UpdateExperienceEntryInput = z.input<typeof updateExperienceEntrySchema>;

export type ExperienceActionResult =
  | { success: true; experienceId: number }
  | { success: false; error: string };

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const experienceActionResultOutputSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true), experienceId: z.number() }),
  z.object({ success: z.literal(false), error: z.string() }),
]);
