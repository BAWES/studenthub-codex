import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const salaryListItemSchema = z.object({
  staff_salary_uuid: z.string(),
  staff_id: z.number().int().nullable(),
  staff_name: z.string().nullable(),
  salary: z.number().nullable(),
  salary_currency: z.string().nullable(),
  comment: z.string().nullable(),
  salary_date: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export type SalaryListItem = z.output<typeof salaryListItemSchema>;

export const listSalariesResultSchema = z.object({
  records: z.array(salaryListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().min(1).max(100),
  totalPages: z.number().int().nonnegative(),
});

export type ListSalariesResult = z.output<typeof listSalariesResultSchema>;

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

export const listSalariesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().max(255).optional(),
});

export const getSalarySchema = z.object({
  salaryUuid: z.string().min(1, "Salary UUID is required"),
});
