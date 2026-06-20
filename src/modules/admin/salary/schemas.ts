import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

export const listSalarySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  search: z.string().optional(),
});

export const createSalarySchema = z.object({
  staffId: z.coerce.number().int().positive("Staff is required"),
  salary: z.coerce.number().min(0, "Salary must be non-negative"),
  salaryCurrency: z.string().min(1).max(3).default("KWD"),
  comment: z.string().max(255).optional(),
  salaryDate: z.coerce.date({ required_error: "Salary date is required" }),
});

export const updateSalarySchema = z.object({
  salaryUuid: z.string().min(1, "Salary UUID is required"),
  salary: z.coerce.number().min(0, "Salary must be non-negative"),
  salaryCurrency: z.string().min(1).max(3).default("KWD"),
  comment: z.string().max(255).optional(),
  salaryDate: z.coerce.date({ required_error: "Salary date is required" }),
});

export const deleteSalarySchema = z.object({
  salaryUuid: z.string().min(1, "Salary UUID is required"),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const salaryItemSchema = z.object({
  staff_salary_uuid: z.string().min(1),
  staff_id: z.number().int().positive().nullable(),
  staff_name: z.string().nullable(),
  salary: z.number().nullable(),
  salary_currency: z.string().nullable(),
  comment: z.string().nullable(),
  salary_date: z.date().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

export const listSalaryResultSchema = z.object({
  salaries: z.array(salaryItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export const getSalaryInputSchema = z.object({
  salaryUuid: z.string().min(1, "Salary UUID is required"),
});

export const salaryDetailResultSchema = z.object({
  salary: salaryItemSchema.nullable(),
  staff_name: z.string().nullable(),
});

export const salaryActionResponseSchema = z.object({
  operation: z.string().min(1),
  message: z.string().min(1),
});

// ---------------------------------------------------------------------------
// Types derived from output schemas
// ---------------------------------------------------------------------------

export type SalaryItem = z.output<typeof salaryItemSchema>;
export type ListSalaryResult = z.output<typeof listSalaryResultSchema>;
export type SalaryActionResponse = z.output<typeof salaryActionResponseSchema>;
export type SalaryDetailResult = z.output<typeof salaryDetailResultSchema>;

export type ListSalaryInput = z.input<typeof listSalarySchema>;
export type CreateSalaryInput = z.input<typeof createSalarySchema>;
export type UpdateSalaryInput = z.input<typeof updateSalarySchema>;
export type DeleteSalaryInput = z.input<typeof deleteSalarySchema>;
