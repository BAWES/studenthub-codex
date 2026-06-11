import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const universityItemSchema = z.object({
  university_id: z.number().int().nonnegative(),
  university_name_en: z.string().nullable(),
  university_name_ar: z.string().nullable(),
});

export type UniversityItem = z.output<typeof universityItemSchema>;

export const listUniversitiesResultSchema = z.object({
  universities: z.array(universityItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive().max(500),
});

export type ListUniversitiesResult = z.output<typeof listUniversitiesResultSchema>;

export const createUniversitySuccessSchema = z.object({
  operation: z.literal("success"),
  message: z.string(),
  university: universityItemSchema,
});

export const createUniversityErrorSchema = z.object({
  operation: z.literal("error"),
  message: z.string(),
});

export const createUniversityResultSchema = z.discriminatedUnion("operation", [
  createUniversitySuccessSchema,
  createUniversityErrorSchema,
]);

export type CreateUniversityResult = z.output<typeof createUniversityResultSchema>;
