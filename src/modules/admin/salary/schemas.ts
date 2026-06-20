import { z } from "zod";

// ---------------------------------------------------------------------------
// Admin salary — schemas and types
// ---------------------------------------------------------------------------

export const listSalarySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  search: z.string().optional(),
});
export type ListSalaryParams = z.input<typeof listSalarySchema>;

export const createSalarySchema = z.object({
  staffId: z.number().int().positive("Staff ID is required"),
  salary: z.number().positive("Salary must be positive"),
  salaryCurrency: z.string().optional(),
  comment: z.string().optional(),
  salaryDate: z.string().min(1, "Salary date is required"),
});
export type CreateSalaryParams = z.input<typeof createSalarySchema>;

export const updateSalarySchema = z.object({
  salaryUuid: z.string().min(1, "Salary UUID is required"),
  salary: z.number().positive("Salary must be positive").optional(),
  salaryCurrency: z.string().optional(),
  salaryDate: z.string().optional(),
});
export type UpdateSalaryParams = z.input<typeof updateSalarySchema>;

export const deleteSalarySchema = z.object({
  salaryUuid: z.string().min(1, "Salary UUID is required"),
});
export type DeleteSalaryParams = z.input<typeof deleteSalarySchema>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

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
  operation: z.string().min(1, "Operation is required"),
  message: z.string().min(1, "Message is required"),
});

// ---------------------------------------------------------------------------
// Types derived from output schemas
// ---------------------------------------------------------------------------

export type SalaryItem = z.output<typeof salaryItemSchema>;
export type ListSalaryResult = z.output<typeof listSalaryResultSchema>;
export type SalaryActionResponse = z.output<typeof salaryActionResponseSchema>;
