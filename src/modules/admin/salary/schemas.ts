import { z } from "zod";

// ---------------------------------------------------------------------------
// Admin salary — schemas and types
// ---------------------------------------------------------------------------

export const listSalaryInputSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
});

export const salaryItemSchema = z.object({
  staff_salary_uuid: z.string().min(1),
  staff_name: z.string().nullable().optional(),
  salary: z.number().nullable().optional(),
  salary_currency: z.string().nullable().optional(),
  comment: z.string().nullable().optional(),
  salary_date: z.date().nullable().optional(),
});

export const listSalariesResultSchema = z.object({
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

export type ListSalaryInput = z.input<typeof listSalaryInputSchema>;
export type SalaryItem = z.output<typeof salaryItemSchema>;
export type ListSalariesResult = z.output<typeof listSalariesResultSchema>;
export type SalaryActionResponse = z.output<typeof salaryActionResponseSchema>;
