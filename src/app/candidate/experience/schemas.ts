import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listExperienceSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const getExperienceSchema = z.object({
  experienceId: z.coerce.number().int().positive("Experience ID is required"),
});

export const createExperienceSchema = z.object({
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

export const updateExperienceSchema = z.object({
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

export const deleteExperienceSchema = z.object({
  experienceId: z.coerce.number().int().positive("Experience ID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListExperienceInput = z.input<typeof listExperienceSchema>;
export type GetExperienceInput = z.input<typeof getExperienceSchema>;
export type CreateExperienceInput = z.input<typeof createExperienceSchema>;
export type UpdateExperienceInput = z.input<typeof updateExperienceSchema>;
export type DeleteExperienceInput = z.input<typeof deleteExperienceSchema>;

export type ExperienceItem = {
  candidate_experience_id: number;
  candidate_id: number | null;
  experience: string;
  employer: string | null;
  start_year: number | null;
  end_year: number | null;
  created_at: Date | null;
};

export type ExperienceActionResult =
  | { success: true; experienceId: number }
  | { success: false; error: string };
