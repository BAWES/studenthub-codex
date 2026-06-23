import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const degreeGroupItemSchema = z.object({
  degree_group_uuid: z.string(),
  degree_group_name_en: z.string(),
  degree_group_name_ar: z.string().nullable(),
  degree_group_sort_order: z.number().int().nullable(),
  skip_major: z.number().int().nullable(),
  degree_group_created_at: z.date().nullable(),
  degree_group_updated_at: z.date().nullable(),
});

export type DegreeGroupItem = z.output<typeof degreeGroupItemSchema>;

export const listDegreeGroupsResultSchema = z.object({
  degreeGroups: z.array(degreeGroupItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().min(1).max(100),
  totalPages: z.number().int().nonnegative(),
});

export type ListDegreeGroupsResult = z.output<typeof listDegreeGroupsResultSchema>;

export const mutationResultSchema = z.object({
  operation: z.enum(["success", "error"]),
  message: z.string(),
});

export type MutationResult = z.output<typeof mutationResultSchema>;

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

export const listDegreeGroupsSchema = z.object({
  nameFilter: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export const getDegreeGroupSchema = z.object({
  uuid: z.string().min(1, "UUID is required"),
});

export const createDegreeGroupSchema = z.object({
  nameEn: z.string().min(1, "English name is required"),
  nameAr: z.string().optional(),
  sortOrder: z.number().int().optional(),
  skipMajor: z.number().int().optional(),
});

export const updateDegreeGroupSchema = z.object({
  uuid: z.string().min(1, "UUID is required"),
  nameEn: z.string().min(1, "English name is required").optional(),
  nameAr: z.string().optional(),
  sortOrder: z.number().int().optional(),
  skipMajor: z.number().int().optional(),
});

export type ListDegreeGroupsInput = z.input<typeof listDegreeGroupsSchema>;
export type GetDegreeGroupInput = z.input<typeof getDegreeGroupSchema>;
export type CreateDegreeGroupInput = z.input<typeof createDegreeGroupSchema>;
export type UpdateDegreeGroupInput = z.input<typeof updateDegreeGroupSchema>;
