import { z } from "zod";

// ---------------------------------------------------------------------------
// Employee Detail schemas — single-employee detail page
// ---------------------------------------------------------------------------

/**
 * Input schema for getEmployeeById.
 */
export const getEmployeeByIdSchema = z.object({
  uuid: z.string().min(1, "Employee UUID is required"),
});

export type GetEmployeeByIdInput = z.input<typeof getEmployeeByIdSchema>;

/**
 * Output schema for a single employee detail.
 */
export const employeeDetailSchema = z.object({
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
  designation_name_en: z.string().nullable(),
  department_name_en: z.string().nullable(),
});

export type EmployeeDetail = z.output<typeof employeeDetailSchema>;
