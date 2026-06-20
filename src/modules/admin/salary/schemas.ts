// ---------------------------------------------------------------------------
// Admin salaries — schemas and types for the admin/salary page
// ---------------------------------------------------------------------------

import { z } from "zod";

export const salaryItemSchema = z.object({
  staff_salary_uuid: z.string(),
  staff_name: z.string().nullable().optional(),
  salary: z.number().nullable().optional(),
  salary_currency: z.string().nullable().optional(),
  comment: z.string().nullable().optional(),
  salary_date: z.date().nullable().optional(),
});

export type SalaryItem = z.infer<typeof salaryItemSchema>;

export const listSalariesResultSchema = z.object({
  salaries: z.array(salaryItemSchema),
  total: z.number(),
});

export type ListSalariesResult = z.infer<typeof listSalariesResultSchema>;
