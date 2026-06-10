import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for candidate/experience/[id] actions
// ---------------------------------------------------------------------------

export const getExperienceEntrySchema = z.object({
  experienceId: z.coerce.number().int().positive("Experience ID is required"),
});

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

export const deleteExperienceEntrySchema = z.object({
  experienceId: z.coerce.number().int().positive("Experience ID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ExperienceEntryResponse =
  | { success: true; experienceId: number }
  | { success: false; error: string };
