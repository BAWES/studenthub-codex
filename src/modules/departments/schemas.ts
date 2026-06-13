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

/** Max 255 because DB column is varchar(255). */
const DEPARTMENT_NAME_MAX = 255;

export const createDepartmentSchema = z.object({
  departmentNameEn: z
    .string()
    .min(1, "English name is required")
    .max(DEPARTMENT_NAME_MAX, `English name must be at most ${DEPARTMENT_NAME_MAX} characters`),
  departmentNameAr: z
    .string()
    .max(DEPARTMENT_NAME_MAX, `Arabic name must be at most ${DEPARTMENT_NAME_MAX} characters`)
    .optional()
    .default(""),
});

export const updateDepartmentSchema = z.object({
  departmentUuid: z.string().min(1, "Department UUID is required"),
  departmentNameEn: z
    .string()
    .min(1, "English name cannot be empty")
    .max(DEPARTMENT_NAME_MAX, `English name must be at most ${DEPARTMENT_NAME_MAX} characters`)
    .optional(),
  departmentNameAr: z
    .string()
    .max(DEPARTMENT_NAME_MAX, `Arabic name must be at most ${DEPARTMENT_NAME_MAX} characters`)
    .optional(),
});

export const deleteDepartmentSchema = z.object({
  departmentUuid: z.string().min(1, "Department UUID is required"),
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
export type CreateDepartmentParams = z.input<typeof createDepartmentSchema>;
export type UpdateDepartmentParams = z.input<typeof updateDepartmentSchema>;
export type DeleteDepartmentParams = z.input<typeof deleteDepartmentSchema>;
export type DepartmentItem = z.output<typeof departmentItemSchema>;
export type ListDepartmentsResult = z.output<typeof listDepartmentsResultSchema>;
