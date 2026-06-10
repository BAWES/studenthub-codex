import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listLanguagesSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const createLanguageSchema = z.object({
  language: z
    .string()
    .min(1, "Language name is required")
    .max(128, "Language name must be 128 characters or fewer")
    .transform((v) => v.trim()),
  proficiency: z
    .string()
    .min(1, "Proficiency level is required")
    .max(32, "Proficiency must be 32 characters or fewer")
    .transform((v) => v.trim()),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListLanguagesInput = z.input<typeof listLanguagesSchema>;
export type CreateLanguageInput = z.input<typeof createLanguageSchema>;

export type LanguageItem = {
  candidate_language_id: number;
  language: string;
  proficiency: string;
  candidate_language_created_at: Date | null;
};

export type LanguageActionResult =
  | { success: true; languageId: number }
  | { success: false; error: string };
