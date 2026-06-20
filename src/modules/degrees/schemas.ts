import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
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

export type DegreeItem = z.output<typeof degreeItemSchema>;

export const listDegreesResultSchema = z.object({
  degrees: z.array(degreeItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().min(1).max(100),
  totalPages: z.number().int().nonnegative(),
});

export type ListDegreesResult = z.output<typeof listDegreesResultSchema>;

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

export const listDegreesSchema = z.object({
  nameFilter: z.string().optional(),
  degreeGroupUuid: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type ListDegreesInput = z.input<typeof listDegreesSchema>;
