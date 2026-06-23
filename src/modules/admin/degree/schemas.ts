import { z } from "zod";

// ---------------------------------------------------------------------------
// Existing schemas (kept for backward compatibility)
// ---------------------------------------------------------------------------

export const listDegreesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
});

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

export const degreeActionResponseSchema = z.object({
  operation: z.string().min(1),
  message: z.string().min(1),
});

export type ListDegreesInput = z.input<typeof listDegreesSchema>;
export type DegreeItem = z.output<typeof degreeItemSchema>;
export type ListDegreesResult = z.output<typeof listDegreesResultSchema>;
export type DegreeActionResponse = z.output<typeof degreeActionResponseSchema>;

// ---------------------------------------------------------------------------
// Inline CRUD schemas
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

export const createDegreeSchema = z.object({
  degree_name_en: z
    .string()
    .min(1, "English name is required")
    .max(255, "English name must be at most 255 characters"),
  degree_name_ar: z
    .string()
    .max(255, "Arabic name must be at most 255 characters")
    .optional()
    .default(""),
  degree_sort_order: z.coerce.number().int().optional(),
  degree_group_uuid: z.string().optional(),
});

export type DegreeListItem = z.output<typeof degreeListItemSchema>;
export type ListDegreeResult = z.output<typeof listDegreeResultSchema>;
export type DegreeIdResult = z.output<typeof degreeIdResultSchema>;
