import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const universityItemSchema = z.object({
  university_id: z.number().int().positive(),
  university_name_en: z.string().nullable(),
  university_name_ar: z.string().nullable(),
});

export type UniversityItem = z.output<typeof universityItemSchema>;

export const listUniversitiesResultSchema = z.object({
  universities: z.array(universityItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().min(1).max(500),
});

export type ListUniversitiesResult = z.output<typeof listUniversitiesResultSchema>;

export const createUniversityResultSchema = z.discriminatedUnion("operation", [
  z.object({
    operation: z.literal("success"),
    message: z.string(),
    university: universityItemSchema,
  }),
  z.object({
    operation: z.literal("error"),
    message: z.string(),
  }),
]);

export type CreateUniversityResult = z.output<typeof createUniversityResultSchema>;
