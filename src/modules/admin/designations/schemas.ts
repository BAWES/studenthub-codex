import { z } from "zod";

export const designationRowSchema = z.object({
  designation_uuid: z.string(),
  designation_name_en: z.string(),
  designation_name_ar: z.string().nullable(),
  designation_created_at: z.date().nullable(),
  designation_updated_at: z.date().nullable(),
});

export type DesignationRow = z.output<typeof designationRowSchema>;

export const listDesignationsResultSchema = z.object({
  designations: z.array(designationRowSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export type ListDesignationsResult = z.output<typeof listDesignationsResultSchema>;

export const actionResponseSchema = z.object({
  operation: z.enum(["success", "error"]),
  message: z.string(),
});

export type ActionResponse = z.output<typeof actionResponseSchema>;

export const listDesignationsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  nameFilter: z.string().optional(),
});

export type ListDesignationsInput = z.input<typeof listDesignationsSchema>;

export const createDesignationSchema = z.object({
  nameEn: z.string().min(1, "English name is required").max(255),
  nameAr: z.string().max(255).optional(),
});

export type CreateDesignationInput = z.input<typeof createDesignationSchema>;

export const updateDesignationSchema = z.object({
  uuid: z.string().min(1, "UUID is required"),
  nameEn: z.string().min(1).max(255).optional(),
  nameAr: z.string().max(255).optional(),
});

export type UpdateDesignationInput = z.input<typeof updateDesignationSchema>;


