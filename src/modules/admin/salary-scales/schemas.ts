import { z } from "zod";

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const salaryScaleItemSchema = z.object({
  salary_scale_id: z.number().int().positive(),
  salary_scale_name_en: z.string(),
  salary_scale_name_ar: z.string().nullable(),
  salary_scale_min_amount: z.number().nullable(),
  salary_scale_max_amount: z.number().nullable(),
  candidate_count: z.number().int().nullable(),
});

export const listSalaryScalesResultSchema = z.object({
  records: z.array(salaryScaleItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export const salaryScaleIdResultSchema = z.object({
  salary_scale_id: z.number().int().positive(),
});

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

export const listSalaryScalesInputSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  search: z.string().optional(),
});

export const createSalaryScaleInputSchema = z.object({
  salary_scale_name_en: z
    .string()
    .min(1, "English name is required")
    .max(255, "English name must be at most 255 characters"),
  salary_scale_name_ar: z
    .string()
    .max(255, "Arabic name must be at most 255 characters")
    .optional()
    .default(""),
  salary_scale_min_amount: z.coerce.number().optional(),
  salary_scale_max_amount: z.coerce.number().optional(),
});

export const updateSalaryScaleInputSchema = z.object({
  salary_scale_id: z.coerce.number().int().positive(),
  salary_scale_name_en: z
    .string()
    .min(1)
    .max(255)
    .optional(),
  salary_scale_name_ar: z
    .string()
    .max(255)
    .nullable()
    .optional(),
  salary_scale_min_amount: z.coerce.number().nullable().optional(),
  salary_scale_max_amount: z.coerce.number().nullable().optional(),
});

// ---------------------------------------------------------------------------
// Types derived from output schemas
// ---------------------------------------------------------------------------

export type SalaryScaleItem = z.output<typeof salaryScaleItemSchema>;
export type ListSalaryScalesResult = z.output<typeof listSalaryScalesResultSchema>;
export type SalaryScaleIdResult = z.output<typeof salaryScaleIdResultSchema>;
