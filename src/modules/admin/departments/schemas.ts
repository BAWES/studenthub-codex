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

const departmentRowSchema = z.object({
  department_uuid: z.string().min(1),
  department_name_en: z.string().min(1),
  department_name_ar: z.string().nullable(),
  employee_count: z.number().int().nonnegative(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const departmentListResponseSchema = z.object({
  items: z.array(departmentRowSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});

export type DepartmentListResponseOutput = z.output<typeof departmentListResponseSchema>;

export const departmentDetailSchema = z.object({
  department: z.object({
    department_uuid: z.string().min(1),
    department_name_en: z.string().min(1),
    department_name_ar: z.string().nullable(),
    department_created_at: z.string().nullable(),
    department_updated_at: z.string().nullable(),
  }).nullable(),
  employee_count: z.number().int().nonnegative(),
});

export type DepartmentDetailOutput = z.output<typeof departmentDetailSchema>;

export const departmentActionResponseSchema = z.object({
  operation: z.enum(["success", "error"]),
  message: z.string().min(1),
  data: departmentRowSchema.optional(),
});

export type DepartmentActionResponseOutput = z.output<typeof departmentActionResponseSchema>;

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
