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

// ---------------------------------------------------------------------------
// CRUD schemas
// ---------------------------------------------------------------------------

export const createSalarySchema = z.object({
  staff_id: z.coerce.number().int().positive("Staff is required").nullable(),
  staff_name: z.string().max(200).optional().default(""),
  salary: z.coerce.number().positive("Salary must be positive").nullable(),
  salary_currency: z.string().max(3).optional().default("KWD"),
  comment: z.string().max(255).optional().default(""),
  salary_date: z.coerce.date().optional(),
});

export const updateSalarySchema = z.object({
  staff_salary_uuid: z.string().min(1, "Salary UUID is required"),
  staff_id: z.coerce.number().int().positive().nullable().optional(),
  staff_name: z.string().max(200).optional(),
  salary: z.coerce.number().positive().nullable().optional(),
  salary_currency: z.string().max(3).optional(),
  comment: z.string().max(255).optional(),
  salary_date: z.coerce.date().optional(),
});

export const deleteSalarySchema = z.object({
  staff_salary_uuid: z.string().min(1, "Salary UUID is required"),
});

export const salaryIdResultSchema = z.object({
  staff_salary_uuid: z.string(),
});

export type SalaryIdResult = z.output<typeof salaryIdResultSchema>;
