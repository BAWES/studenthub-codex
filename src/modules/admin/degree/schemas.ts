import { z } from "zod";

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const degreeItemSchema = z.object({
  degree_uuid: z.string().min(1),
  degree_group_uuid: z.string().nullable(),
  degree_name_en: z.string().min(1),
  degree_name_ar: z.string().nullable(),
  degree_sort_order: z.number().int().nullable(),
  degree_created_at: z.date().nullable(),
  degree_updated_at: z.date().nullable(),
});

export const listDegreesResultSchema = z.object({
  degrees: z.array(degreeItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

// ---------------------------------------------------------------------------
// Types derived from output schemas
// ---------------------------------------------------------------------------

export type DegreeItem = z.output<typeof degreeItemSchema>;
export type ListDegreesResult = z.output<typeof listDegreesResultSchema>;
