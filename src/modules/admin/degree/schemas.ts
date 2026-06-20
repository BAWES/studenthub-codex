import { z } from "zod";

export const listDegreesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
});

export const createDegreeSchema = z.object({
  degreeNameEn: z.string().min(1, "English name is required").max(255),
  degreeNameAr: z.string().max(255).optional(),
  degreeGroupUuid: z.string().max(60).optional(),
  degreeSortOrder: z.coerce.number().int().optional(),
});

export const updateDegreeSchema = z.object({
  degreeUuid: z.string().min(1, "Degree UUID is required"),
  degreeNameEn: z.string().min(1, "English name is required").max(255),
  degreeNameAr: z.string().max(255).optional(),
  degreeGroupUuid: z.string().max(60).optional(),
  degreeSortOrder: z.coerce.number().int().optional(),
});

export const deleteDegreeSchema = z.object({
  degreeUuid: z.string().min(1, "Degree UUID is required"),
});

export const degreeItemSchema = z.object({
  degree_uuid: z.string().min(1),
  degree_name_en: z.string().min(1),
  degree_name_ar: z.string().nullable(),
  degree_group_uuid: z.string().nullable(),
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
export type CreateDegreeInput = z.input<typeof createDegreeSchema>;
export type UpdateDegreeInput = z.input<typeof updateDegreeSchema>;
export type DeleteDegreeInput = z.input<typeof deleteDegreeSchema>;

export type DegreeItem = z.output<typeof degreeItemSchema>;
export type ListDegreesResult = z.output<typeof listDegreesResultSchema>;
export type DegreeActionResponse = z.output<typeof degreeActionResponseSchema>;
