import { z } from "zod";

export const listMajorsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
});

export const createMajorSchema = z.object({
  majorNameEn: z.string().min(1, "English name is required").max(150),
  majorNameAr: z.string().min(1, "Arabic name is required").max(150),
});

export const updateMajorSchema = z.object({
  majorUuid: z.string().min(1, "Major UUID is required"),
  majorNameEn: z.string().min(1, "English name is required").max(150),
  majorNameAr: z.string().min(1, "Arabic name is required").max(150),
});

export const deleteMajorSchema = z.object({
  majorUuid: z.string().min(1, "Major UUID is required"),
});

export const majorItemSchema = z.object({
  major_uuid: z.string().min(1),
  major_name_en: z.string().min(1),
  major_name_ar: z.string().min(1),
  data_source: z.number().int().nullable(),
  major_created_at: z.date().nullable(),
  major_updated_at: z.date().nullable(),
});

export const listMajorsResultSchema = z.object({
  majors: z.array(majorItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export const majorActionResponseSchema = z.object({
  operation: z.string().min(1),
  message: z.string().min(1),
});

export const majorIdResultSchema = z.object({
  major_uuid: z.string().min(1),
});

export type ListMajorsInput = z.input<typeof listMajorsSchema>;
export type CreateMajorInput = z.input<typeof createMajorSchema>;
export type UpdateMajorInput = z.input<typeof updateMajorSchema>;
export type DeleteMajorInput = z.input<typeof deleteMajorSchema>;

export type MajorItem = z.output<typeof majorItemSchema>;
export type ListMajorsResult = z.output<typeof listMajorsResultSchema>;
export type MajorActionResponse = z.output<typeof majorActionResponseSchema>;
