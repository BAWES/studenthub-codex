import { z } from "zod";

export const employeeRowSchema = z.object({
  employee_uuid: z.string(),
  employee_name: z.string(),
  employee_email: z.string(),
  employee_phone: z.string().nullable(),
  employee_salary: z.number().nullable(),
  employee_status: z.number().int(),
  employee_role: z.string().nullable(),
  employee_created_at: z.date(),
  employee_updated_at: z.date(),
  designation_uuid: z.string().nullable(),
  department_uuid: z.string().nullable(),
});

export type EmployeeRow = z.output<typeof employeeRowSchema>;

export const listEmployeesResultSchema = z.object({
  employees: z.array(employeeRowSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export type ListEmployeesResult = z.output<typeof listEmployeesResultSchema>;

export const actionResponseSchema = z.object({
  operation: z.enum(["success", "error"]),
  message: z.string(),
});

export type ActionResponse = z.output<typeof actionResponseSchema>;

export const listEmployeesSchema = z.object({
  name: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

export type ListEmployeesInput = z.input<typeof listEmployeesSchema>;

// ---------------------------------------------------------------------------
// Input schema: getEmployeeById
// ---------------------------------------------------------------------------

export const getEmployeeByIdSchema = z.object({
  uuid: z.string().min(1, "Employee UUID is required"),
});

export type GetEmployeeByIdInput = z.input<typeof getEmployeeByIdSchema>;

// ---------------------------------------------------------------------------
// Output schema: employeeDetailSchema
// ---------------------------------------------------------------------------

export const employeeDetailSchema = z.object({
  employee_uuid: z.string(),
  employee_name: z.string(),
  employee_email: z.string(),
  employee_phone: z.string().nullable(),
  employee_salary: z.number().nullable(),
  employee_status: z.number().int(),
  employee_role: z.string().nullable(),
  employee_created_at: z.date(),
  employee_updated_at: z.date(),
  designation_uuid: z.string().nullable(),
  department_uuid: z.string().nullable(),
  designation_name_en: z.string().nullable(),
  department_name_en: z.string().nullable(),
});

export type EmployeeDetail = z.output<typeof employeeDetailSchema>;

export const createEmployeeSchema = z.object({
  employeeName: z.string().min(1, "Name is required").max(255),
  employeeEmail: z.string().email("Invalid email").max(255),
  employeePhone: z.string().max(45).optional(),
  employeeSalary: z.coerce.number().positive().optional(),
  employeeStatus: z.coerce.number().int().optional().default(10),
  employeeRole: z.string().optional().default("staff"),
  designationUuid: z.string().optional(),
  departmentUuid: z.string().optional(),
});

export type CreateEmployeeInput = z.input<typeof createEmployeeSchema>;

// ---------------------------------------------------------------------------
// Schema: updateEmployeeRole
// ---------------------------------------------------------------------------

export const ROLES = ["staff", "admin"] as const;

export const updateEmployeeRoleSchema = z.object({
  uuid: z.string().min(1, "Employee UUID is required"),
  role: z.enum(ROLES, { errorMap: () => ({ message: "Role must be 'staff' or 'admin'" }) }),
});

export type UpdateEmployeeRoleInput = z.input<typeof updateEmployeeRoleSchema>;
