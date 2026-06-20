import { z } from "zod";

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/** Shape returned by getAdminDegreeGroupRows() for the DataTable */
export const degreeGroupListItemSchema = z.object({
  id: z.string().uuid(),
  name_en: z.string().min(1),
  name_ar: z.string().nullable(),
  sort_order: z.number().int(),
  skip_major: z.number().int().min(0).max(1),
  degree_count: z.number().int().nonnegative(),
  created: z.string(),
  updated: z.string(),
});

/** Shape returned by getDegreeGroupDetail() for the detail form */
export const degreeGroupDetailSchema = z.object({
  degree_group_uuid: z.string().uuid(),
  degree_group_name_en: z.string().min(1),
  degree_group_name_ar: z.string().nullable(),
  degree_group_sort_order: z.number().int().nullable(),
  skip_major: z.number().int().nullable(),
  degree_group_created_at: z.date().nullable(),
  degree_group_updated_at: z.date().nullable(),
});

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

/** Input for createDegreeGroup() */
export const createDegreeGroupInputSchema = z.object({
  degree_group_name_en: z.string().min(1, "Name (English) is required"),
  degree_group_name_ar: z.string().optional(),
  degree_group_sort_order: z.coerce.number().int().optional(),
  skip_major: z.coerce.number().int().min(0).max(1).optional(),
});

/** Input for updateDegreeGroup() */
export const updateDegreeGroupInputSchema = z.object({
  degree_group_name_en: z.string().min(1, "Name (English) is required"),
  degree_group_name_ar: z.string().optional(),
  degree_group_sort_order: z.coerce.number().int().optional(),
  skip_major: z.coerce.number().int().min(0).max(1).optional(),
});

// ---------------------------------------------------------------------------
// Types derived from output schemas
// ---------------------------------------------------------------------------

export type DegreeGroupListItem = z.output<typeof degreeGroupListItemSchema>;
export type DegreeGroupDetail = z.output<typeof degreeGroupDetailSchema>;
export type CreateDegreeGroupInput = z.output<typeof createDegreeGroupInputSchema>;
export type UpdateDegreeGroupInput = z.output<typeof updateDegreeGroupInputSchema>;
