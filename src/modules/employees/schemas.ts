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
export type ListEmployeesInput = z.input<typeof listEmployeesSchema>;
export type CreateEmployeeInput = z.input<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.input<typeof updateEmployeeSchema>;
export type EmployeeItem = {
  employee_uuid: string;
  employee_name: string;
  employee_email: string;
  employee_phone: string | null;
  employee_salary: number | null;
  employee_status: number;
  employee_created_at: Date;
  employee_updated_at: Date;
  designation_uuid: string | null;
  department_uuid: string | null;
};
export type EmployeeDetail = EmployeeItem | null;
export type ListEmployeesResult = {
  employees: EmployeeItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
export type CreateEmployeeResult = {
  employee_uuid: string;
};
export type UpdateEmployeeResult = {
  employee_uuid: string;
};
