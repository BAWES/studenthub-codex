import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

export const listMajorsSchema = z.object({
  nameFilter: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single major item in the list response.
 */
export const majorItemSchema = z.object({
  major_uuid: z.string(),
  major_name_en: z.string(),
  major_name_ar: z.string(),
  data_source: z.number().int().nullable(),
  major_created_at: z.date().nullable(),
  major_updated_at: z.date().nullable(),
});

/**
 * Schema for the listMajors response.
 */
export const listMajorsResultSchema = z.object({
  majors: z.array(majorItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListMajorsInput = z.input<typeof listMajorsSchema>;
export type MajorItem = z.output<typeof majorItemSchema>;
export type ListMajorsResult = z.output<typeof listMajorsResultSchema>;
