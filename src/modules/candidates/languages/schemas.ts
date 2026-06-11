import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

export const listLanguagesSchema = z.object({
  candidateId: z.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const getLanguageSchema = z.object({
  candidateId: z.number().int().positive(),
  languageId: z.number().int().positive(),
});

export const createLanguageSchema = z.object({
  candidateId: z.number().int().positive(),
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

export const updateLanguageSchema = z.object({
  candidateId: z.number().int().positive(),
  languageId: z.number().int().positive(),
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

export const deleteLanguageSchema = z.object({
  candidateId: z.number().int().positive(),
  languageId: z.number().int().positive(),
});

// Input types
export type ListLanguagesParams = z.input<typeof listLanguagesSchema>;
export type GetLanguageParams = z.input<typeof getLanguageSchema>;
export type CreateLanguageParams = z.input<typeof createLanguageSchema>;
export type UpdateLanguageParams = z.input<typeof updateLanguageSchema>;
export type DeleteLanguageParams = z.input<typeof deleteLanguageSchema>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const languageItemSchema = z.object({
  candidate_language_id: z.number().int().positive(),
  language: z.string(),
  proficiency: z.string(),
  candidate_language_created_at: z.date().nullable(),
});

export const languageActionResultSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true), languageId: z.number().int().positive() }),
  z.object({ success: z.literal(false), error: z.string() }),
]);

export const languageDetailResponseSchema = z.union([
  z.object({ data: languageItemSchema, error: z.null() }),
  z.object({ data: z.null(), error: z.string().nullable() }),
]);

// Output types
export type LanguageItem = z.output<typeof languageItemSchema>;
export type LanguageActionResult = z.output<typeof languageActionResultSchema>;
export type LanguageDetailResponse = z.output<typeof languageDetailResponseSchema>;
