import { z } from "zod";

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single university list item.
 */
export const universityListItemSchema = z.object({
  university_id: z.number().int(),
  university_name_en: z.string().nullable(),
  university_name_ar: z.string().nullable(),
  university_data_source: z.number().int().nullable(),
  university_created_at: z.string().nullable(),
  university_updated_at: z.string().nullable(),
  deleted: z.number().int(),
});

/**
 * Schema for the listUniversities response.
 */
export const listUniversitiesResultSchema = z.object({
  records: z.array(universityListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

/**
 * Schema for mutation responses returning { university_id }.
 */
export const universityIdResultSchema = z.object({
  university_id: z.number().int(),
});

// ---------------------------------------------------------------------------
// Types derived from output schemas
// ---------------------------------------------------------------------------

export type UniversityListItem = z.output<typeof universityListItemSchema>;
export type ListUniversitiesResult = z.output<typeof listUniversitiesResultSchema>;
export type UniversityIdResult = z.output<typeof universityIdResultSchema>;
