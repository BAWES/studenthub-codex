import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const designationItemSchema = z.object({
  designation_uuid: z.string().min(1),
  designation_name_en: z.string().min(1),
  designation_name_ar: z.string().nullable(),
});

export type DesignationItem = z.output<typeof designationItemSchema>;

export const listDesignationsResultSchema = z.object({
  designations: z.array(designationItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().min(1).max(100),
  totalPages: z.number().int().nonnegative(),
});

export type ListDesignationsResult = z.output<typeof listDesignationsResultSchema>;

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

export const listDesignationsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  nameFilter: z.string().optional(),
});

export const getDesignationSchema = z.object({
  uuid: z.string().min(1, "Designation UUID is required"),
});
