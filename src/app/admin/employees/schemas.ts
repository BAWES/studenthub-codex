import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const employeeRowSchema = z.object({
  employee_uuid: z.string(),
  employee_name: z.string(),
  employee_email: z.string(),
  employee_phone: z.string().nullable(),
  employee_salary: z.number().nullable(),
  employee_status: z.number().int(),
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

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

export const listEmployeesSchema = z.object({
  name: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

export type ListEmployeesInput = z.input<typeof listEmployeesSchema>;

export const createEmployeeSchema = z.object({
  employeeName: z.string().min(1, "Name is required").max(255),
  employeeEmail: z.string().email("Invalid email").max(255),
  employeePhone: z.string().max(45).optional(),
  employeeSalary: z.coerce.number().positive().optional(),
  employeeStatus: z.coerce.number().int().optional().default(10),
  designationUuid: z.string().optional(),
  departmentUuid: z.string().optional(),
});

export type CreateEmployeeInput = z.input<typeof createEmployeeSchema>;
