import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const staffSalaryItemSchema = z.object({
  staff_salary_uuid: z.string(),
  staff_id: z.number().nullable(),
  salary: z.number().nullable(),
  salary_currency: z.string().nullable(),
  comment: z.string().nullable(),
  salary_date: z.date().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

export type StaffSalaryItem = z.output<typeof staffSalaryItemSchema>;

export const listStaffSalariesResultSchema = z.object({
  salaries: z.array(staffSalaryItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().min(1).max(100),
  totalPages: z.number().int().nonnegative(),
});

export type ListStaffSalariesResult = z.output<typeof listStaffSalariesResultSchema>;

export const salaryActionResultSchema = z.object({
  operation: z.string(),
  message: z.string(),
});

export type SalaryActionResult = z.output<typeof salaryActionResultSchema>;
