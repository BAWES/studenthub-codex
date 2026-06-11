import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listDepartmentsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  q: z.string().optional(),
});

export const getDepartmentSchema = z.object({
  departmentUuid: z.string().min(1, "Department UUID is required"),
});

export const createDepartmentSchema = z.object({
  departmentNameEn: z.string().min(1, "English name is required").max(255),
  departmentNameAr: z.string().max(255).optional(),
});

export const updateDepartmentSchema = z.object({
  departmentUuid: z.string().min(1, "Department UUID is required"),
  departmentNameEn: z.string().max(255).optional(),
  departmentNameAr: z.string().max(255).optional(),
});

export const deleteDepartmentSchema = z.object({
  departmentUuid: z.string().min(1, "Department UUID is required"),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a department row in the listing.
 */
export const departmentRowSchema = z.object({
  department_uuid: z.string().min(1),
  department_name_en: z.string().min(1),
  department_name_ar: z.string().nullable(),
  employee_count: z.number().int().nonnegative(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

/**
 * Schema for the listDepartments response.
 */
export const departmentListResponseSchema = z.object({
  items: z.array(departmentRowSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

/**
 * Schema for the department detail response.
 */
export const departmentDetailSchema = z.object({
  department: z
    .object({
      department_uuid: z.string(),
      department_name_en: z.string(),
      department_name_ar: z.string().nullable(),
      department_created_at: z.string().nullable(),
      department_updated_at: z.string().nullable(),
    })
    .nullable(),
  employee_count: z.number().int().nonnegative(),
});

/**
 * Schema for the department mutation response (create/update/delete).
 */
export const departmentActionResponseSchema = z.object({
  operation: z.enum(["success", "error"]),
  message: z.string(),
  data: departmentRowSchema.optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListDepartmentsInput = z.input<typeof listDepartmentsSchema>;
export type GetDepartmentInput = z.input<typeof getDepartmentSchema>;
export type CreateDepartmentInput = z.input<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.input<typeof updateDepartmentSchema>;
export type DeleteDepartmentInput = z.input<typeof deleteDepartmentSchema>;

export type DepartmentRow = {
  department_uuid: string;
  department_name_en: string;
  department_name_ar: string | null;
  employee_count: number;
  created_at: string | null;
  updated_at: string | null;
};

export type DepartmentDetail = {
  department: {
    department_uuid: string;
    department_name_en: string;
    department_name_ar: string | null;
    department_created_at: string | null;
    department_updated_at: string | null;
  } | null;
  employee_count: number;
};

export type DepartmentActionResponse = {
  operation: "success" | "error";
  message: string;
  data?: DepartmentRow;
};

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const departmentListResponseSchema = z.object({
  items: z.array(z.object({
    department_uuid: z.string(),
    department_name_en: z.string(),
    department_name_ar: z.string().nullable(),
    employee_count: z.number().int().min(0),
    created_at: z.string().nullable(),
    updated_at: z.string().nullable(),
  })),
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  totalPages: z.number().int().min(0),
});

export const departmentDetailSchema = z.object({
  department: z.object({
    department_uuid: z.string(),
    department_name_en: z.string(),
    department_name_ar: z.string().nullable(),
    department_created_at: z.string().nullable(),
    department_updated_at: z.string().nullable(),
  }).nullable(),
  employee_count: z.number().int().min(0),
});

export const departmentActionResponseSchema = z.object({
  operation: z.enum(["success", "error"]),
  message: z.string(),
  data: z.object({
    department_uuid: z.string(),
    department_name_en: z.string(),
    department_name_ar: z.string().nullable(),
    employee_count: z.number().int().min(0),
    created_at: z.string().nullable(),
    updated_at: z.string().nullable(),
  }).optional(),
});
