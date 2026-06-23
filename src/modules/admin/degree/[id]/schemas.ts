import { z } from "zod";

/**
 * Input schema for getDegree.
 */
export const getDegreeSchema = z.object({
  degreeUuid: z.string().min(1, "Degree UUID is required"),
});

/**
 * Schema for a single degree group in detail response.
 */
export const degreeGroupRefSchema = z.object({
  degree_group_uuid: z.string().min(1),
  degree_group_name_en: z.string().min(1),
});

/**
 * Schema for a single degree item in detail response.
 */
export const degreeDetailItemSchema = z.object({
  degree_uuid: z.string().min(1),
  degree_group_uuid: z.string().nullable(),
  degree_name_en: z.string().min(1),
  degree_name_ar: z.string().nullable(),
  degree_sort_order: z.number().int().nullable(),
  degree_created_at: z.date().nullable(),
  degree_updated_at: z.date().nullable(),
  degree_group: degreeGroupRefSchema.nullable(),
});

/**
 * Output schema for getDegree.
 */
export const getDegreeResultSchema = z.object({
  degree: degreeDetailItemSchema.nullable(),
});

/**
 * Schema for listing degree groups (for form select).
 */
export const degreeGroupSelectItemSchema = z.object({
  degree_group_uuid: z.string().min(1),
  degree_group_name_en: z.string().min(1),
});

export type DegreeDetailItem = z.output<typeof degreeDetailItemSchema>;
export type GetDegreeResult = z.output<typeof getDegreeResultSchema>;
export type GetDegreeInput = z.input<typeof getDegreeSchema>;
export type DegreeGroupSelectItem = z.output<typeof degreeGroupSelectItemSchema>;
