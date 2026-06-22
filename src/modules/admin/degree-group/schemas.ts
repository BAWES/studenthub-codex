import { z } from "zod";

export const listDegreeGroupsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
});

export const createDegreeGroupSchema = z.object({
  degree_group_name_en: z.string().min(1, "English name is required").max(255),
  degree_group_name_ar: z.string().max(255).optional(),
  degree_group_sort_order: z.coerce.number().int().optional(),
  skip_major: z.coerce.number().int().optional(),
});

export const updateDegreeGroupSchema = z.object({
  degree_group_uuid: z.string().min(1, "UUID is required"),
  degree_group_name_en: z.string().min(1, "English name is required").max(255),
  degree_group_name_ar: z.string().max(255).optional().nullable(),
  degree_group_sort_order: z.coerce.number().int().optional().nullable(),
  skip_major: z.coerce.number().int().optional().nullable(),
});

export const deleteDegreeGroupSchema = z.object({
  degree_group_uuid: z.string().min(1, "UUID is required"),
});

export const degreeGroupItemSchema = z.object({
  degree_group_uuid: z.string(),
  degree_group_name_en: z.string(),
  degree_group_name_ar: z.string().nullable(),
  degree_group_sort_order: z.number().int().nullable(),
  skip_major: z.number().int().nullable(),
  degree_group_created_at: z.date().nullable(),
  degree_group_updated_at: z.date().nullable(),
});

export const listDegreeGroupsResultSchema = z.object({
  degree_groups: z.array(degreeGroupItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export const degreeGroupActionResponseSchema = z.object({
  operation: z.string().min(1),
  message: z.string().min(1),
});

export type ListDegreeGroupsInput = z.input<typeof listDegreeGroupsSchema>;
export type CreateDegreeGroupInput = z.input<typeof createDegreeGroupSchema>;
export type UpdateDegreeGroupInput = z.input<typeof updateDegreeGroupSchema>;
export type DeleteDegreeGroupInput = z.input<typeof deleteDegreeGroupSchema>;

export type DegreeGroupItem = z.output<typeof degreeGroupItemSchema>;
export type ListDegreeGroupsResult = z.output<typeof listDegreeGroupsResultSchema>;
export type DegreeGroupActionResponse = z.output<typeof degreeGroupActionResponseSchema>;
