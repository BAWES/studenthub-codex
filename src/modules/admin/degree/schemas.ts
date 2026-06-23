import { z } from "zod";

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const degreeListItemSchema = z.object({
  degree_uuid: z.string(),
  degree_name_en: z.string(),
  degree_name_ar: z.string().nullable(),
  degree_sort_order: z.number().int().nullable(),
  degree_group_uuid: z.string().nullable(),
  group_name_en: z.string().nullable(),
});

export const listDegreeResultSchema = z.object({
  records: z.array(degreeListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export const degreeIdResultSchema = z.object({
  degree_uuid: z.string().uuid(),
});

// ---------------------------------------------------------------------------
// Types derived from output schemas
// ---------------------------------------------------------------------------

export type DegreeListItem = z.output<typeof degreeListItemSchema>;
export type ListDegreeResult = z.output<typeof listDegreeResultSchema>;
export type DegreeIdResult = z.output<typeof degreeIdResultSchema>;
