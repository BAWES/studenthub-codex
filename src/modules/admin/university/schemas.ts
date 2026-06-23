import { z } from "zod";

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const universityListItemSchema = z.object({
  university_id: z.number().int(),
  university_name_en: z.string().nullable(),
  university_name_ar: z.string().nullable(),
  university_data_source: z.number().int().nullable(),
  deleted: z.number().int(),
});

export const listUniversityResultSchema = z.object({
  records: z.array(universityListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export const universityIdResultSchema = z.object({
  university_id: z.number().int(),
});

// ---------------------------------------------------------------------------
// Types derived from output schemas
// ---------------------------------------------------------------------------

export type UniversityListItem = z.output<typeof universityListItemSchema>;
export type ListUniversityResult = z.output<typeof listUniversityResultSchema>;
export type UniversityIdResult = z.output<typeof universityIdResultSchema>;
