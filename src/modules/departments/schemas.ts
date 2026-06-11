import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

export const listDepartmentsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  nameFilter: z.string().optional(),
});

export const getDepartmentSchema = z.object({
  uuid: z.string().min(1, "Department UUID is required"),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const departmentItemSchema = z.object({
  department_uuid: z.string(),
  department_name_en: z.string(),
  department_name_ar: z.string().nullable(),
});

export const listDepartmentsResultSchema = z.object({
  departments: z.array(departmentItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListDepartmentsParams = z.input<typeof listDepartmentsSchema>;
export type GetDepartmentParams = z.input<typeof getDepartmentSchema>;
export type DepartmentItem = z.output<typeof departmentItemSchema>;
export type ListDepartmentsResult = z.output<typeof listDepartmentsResultSchema>;
