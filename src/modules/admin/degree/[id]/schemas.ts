import { z } from "zod";

/**
 * Input schema for getDegree.
 */
export const getDegreeSchema = z.object({
  degreeUuid: z.string().min(1, "Degree UUID is required"),
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
});

/**
 * Output schema for getDegree.
 */
export const getDegreeResultSchema = z.object({
  degree: degreeDetailItemSchema.nullable(),
});

export type DegreeDetailItem = z.output<typeof degreeDetailItemSchema>;
export type GetDegreeResult = z.output<typeof getDegreeResultSchema>;
export type GetDegreeInput = z.input<typeof getDegreeSchema>;
