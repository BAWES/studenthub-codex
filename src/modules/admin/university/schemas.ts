import { z } from "zod";

export const listUniversitiesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
});

export const createUniversitySchema = z.object({
  university_name_en: z.string().max(100).optional().nullable(),
  university_name_ar: z.string().max(100).optional().nullable(),
  university_data_source: z.coerce.number().int().optional().nullable(),
});

export const updateUniversitySchema = z.object({
  university_id: z.coerce.number().int().positive("University ID is required"),
  university_name_en: z.string().max(100).optional().nullable(),
  university_name_ar: z.string().max(100).optional().nullable(),
  university_data_source: z.coerce.number().int().optional().nullable(),
});

export const deleteUniversitySchema = z.object({
  university_id: z.coerce.number().int().positive("University ID is required"),
});

export const universityItemSchema = z.object({
  university_id: z.number().int().positive(),
  university_name_en: z.string().nullable(),
  university_name_ar: z.string().nullable(),
  university_data_source: z.number().int().nullable(),
});

export const listUniversitiesResultSchema = z.object({
  items: z.array(universityItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export const universityActionResponseSchema = z.object({
  operation: z.string().min(1),
  message: z.string().min(1),
});

export type ListUniversitiesInput = z.input<typeof listUniversitiesSchema>;
export type CreateUniversityInput = z.input<typeof createUniversitySchema>;
export type UpdateUniversityInput = z.input<typeof updateUniversitySchema>;
export type DeleteUniversityInput = z.input<typeof deleteUniversitySchema>;
export type UniversityItem = z.output<typeof universityItemSchema>;
export type ListUniversitiesResult = z.output<typeof listUniversitiesResultSchema>;
export type UniversityActionResponse = z.output<typeof universityActionResponseSchema>;
