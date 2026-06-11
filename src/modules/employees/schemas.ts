import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for src/modules/employees actions
// ---------------------------------------------------------------------------

export const listEmployeesSchema = z.object({
  name: z.string().optional(),
  status: z.coerce.number().int().optional(),
  departmentUuid: z.string().optional(),
  designationUuid: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});
export const getEmployeeSchema = z.object({
  employeeUuid: z.string().min(1, "Employee UUID is required"),
});
export const createEmployeeSchema = z.object({
  employeeName: z
    .string({ required_error: "Employee name is required" })
    .min(1, "Employee name is required")
    .max(255),
  employeeEmail: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .max(255),
  employeePhone: z.string().max(45).optional(),
  employeeSalary: z.coerce.number().positive().optional(),
  employeeStatus: z.coerce.number().int().optional().default(10),
  designationUuid: z.string().optional(),
  departmentUuid: z.string().optional(),
});
export const updateEmployeeSchema = z.object({
  employeeUuid: z.string().min(1, "Employee UUID is required"),
  employeeName: z.string().min(1).max(255).optional(),
  employeeEmail: z.string().email().max(255).optional(),
  employeePhone: z.string().max(45).optional(),
  employeeSalary: z.coerce.number().positive().optional(),
  employeeStatus: z.coerce.number().int().optional(),
  designationUuid: z.string().optional(),
  departmentUuid: z.string().optional(),
});
// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single employee item returned from listEmployees / getEmployee.
 */
export const employeeItemSchema = z.object({
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

/**
 * Schema for getEmployee result (item or null).
 */
export const employeeDetailSchema = employeeItemSchema.nullable();

/**
 * Schema for the listEmployees response.
 */
export const listEmployeesResultSchema = z.object({
  employees: z.array(employeeItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

/**
 * Schema for the createEmployee response.
 */
export const createEmployeeResultSchema = z.object({
  employee_uuid: z.string(),
});

/**
 * Schema for the updateEmployee response.
 */
export const updateEmployeeResultSchema = z.object({
  employee_uuid: z.string(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListEmployeesInput = z.input<typeof listEmployeesSchema>;
export type CreateEmployeeInput = z.input<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.input<typeof updateEmployeeSchema>;
export type EmployeeItem = z.output<typeof employeeItemSchema>;
export type EmployeeDetail = z.output<typeof employeeDetailSchema>;
export type ListEmployeesResult = z.output<typeof listEmployeesResultSchema>;
export type CreateEmployeeResult = z.output<typeof createEmployeeResultSchema>;
export type UpdateEmployeeResult = z.output<typeof updateEmployeeResultSchema>;
