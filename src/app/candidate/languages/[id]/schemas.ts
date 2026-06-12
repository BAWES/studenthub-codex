import { z } from "zod";

import { languageItemOutputSchema } from "../schemas";

// ---------------------------------------------------------------------------
// Schemas for candidate/languages/[id] actions
// ---------------------------------------------------------------------------

const PROFICIENCY_LEVELS = ["basic", "intermediate", "advanced", "native"] as const;

export const getLanguageSchema = z.object({
  languageId: z.coerce.number().int().positive("Language ID is required"),
});

export const updateLanguageSchema = z.object({
  languageId: z.coerce.number().int().positive("Language ID is required"),
  language: z
    .string()
    .min(1, "Language is required")
    .max(128, "Language must be 128 characters or fewer")
    .transform((v) => v.trim()),
  proficiency: z.enum(PROFICIENCY_LEVELS, {
    required_error: "Proficiency level is required",
  }),
});

export const deleteLanguageSchema = z.object({
  languageId: z.coerce.number().int().positive("Language ID is required"),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

// Re-export parent output schema for consumer convenience
export { languageItemOutputSchema };

export const languageDetailResponseOutputSchema = z.union([
  z.object({
    data: languageItemOutputSchema,
    error: z.null(),
  }),
  z.object({
    data: z.null(),
    error: z.string().nullable(),
  }),
]);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GetLanguageInput = z.input<typeof getLanguageSchema>;
export type UpdateLanguageInput = z.input<typeof updateLanguageSchema>;
export type DeleteLanguageInput = z.input<typeof deleteLanguageSchema>;

export type LanguageItem = {
  candidate_language_id: number;
  language: string;
  proficiency: string;
  candidate_language_created_at: Date | null;
};

export type LanguageDetailResponse<T = LanguageItem> =
  | { data: T; error: null }
  | { data: null; error: string | null };
