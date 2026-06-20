import { z } from "zod";

// ---------------------------------------------------------------------------
// Admin salary — schemas and types
// ---------------------------------------------------------------------------

export const listSalarySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  search: z.string().optional(),
});

export const getSalarySchema = z.object({
  salaryUuid: z.string().min(1, "Salary UUID is required"),
});

export const createSalarySchema = z.object({
  staffId: z.number().int().positive("Staff ID is required"),
  salary: z.number().positive("Salary must be a positive number"),
  salaryCurrency: z.string().min(1, "Currency is required"),
  comment: z.string().optional(),
  salaryDate: z.string().min(1, "Salary date is required"),
});

export const updateSalarySchema = z.object({
  salaryUuid: z.string().min(1, "Salary UUID is required"),
  salary: z.number().positive("Salary must be a positive number"),
  salaryCurrency: z.string().min(1, "Currency is required"),
  comment: z.string().optional(),
  salaryDate: z.string().min(1, "Salary date is required"),
});

export const deleteSalarySchema = z.object({
  salaryUuid: z.string().min(1, "Salary UUID is required"),
});

export const salaryItemSchema = z.object({
  staff_salary_uuid: z.string().min(1),
  staff_id: z.number().int().nullable().optional(),
  staff_name: z.string().nullable().optional(),
  salary: z.number().nullable().optional(),
  salary_currency: z.string().nullable().optional(),
  comment: z.string().nullable().optional(),
  salary_date: z.date().nullable().optional(),
  created_at: z.date().nullable().optional(),
  updated_at: z.date().nullable().optional(),
});

export const listSalaryResultSchema = z.object({
  salaries: z.array(salaryItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export const salaryActionResponseSchema = z.object({
  operation: z.string().min(1),
  message: z.string().min(1),
});

// ---------------------------------------------------------------------------
// Types derived from output schemas
// ---------------------------------------------------------------------------

export type ListSalaryInput = z.input<typeof listSalarySchema>;
export type GetSalaryParams = z.input<typeof getSalarySchema>;
export type CreateSalaryParams = z.input<typeof createSalarySchema>;
export type UpdateSalaryParams = z.input<typeof updateSalarySchema>;
export type DeleteSalaryParams = z.input<typeof deleteSalarySchema>;
export type SalaryItem = z.output<typeof salaryItemSchema>;
export type ListSalaryResult = z.output<typeof listSalaryResultSchema>;
export type SalaryActionResponse = z.output<typeof salaryActionResponseSchema>;
