import { z } from "zod";

// ---------------------------------------------------------------------------
// List schemas (backward-compatible paginated list)
// ---------------------------------------------------------------------------

export const listSalaryScalesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
});

export const salaryScaleItemSchema = z.object({
  salary_scale_uuid: z.string().min(1),
  salary_scale_name_en: z.string().min(1),
  salary_scale_name_ar: z.string().nullable(),
  salary_scale_min_salary: z.number().nullable(),
  salary_scale_mid_salary: z.number().nullable(),
  salary_scale_max_salary: z.number().nullable(),
  salary_scale_currency: z.string().nullable(),
  salary_scale_sort_order: z.number().int().nullable(),
  salary_scale_created_at: z.date().nullable(),
  salary_scale_updated_at: z.date().nullable(),
});

export const listSalaryScalesResultSchema = z.object({
  items: z.array(salaryScaleItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export type ListSalaryScalesInput = z.input<typeof listSalaryScalesSchema>;
export type SalaryScaleItem = z.output<typeof salaryScaleItemSchema>;
export type ListSalaryScalesResult = z.output<typeof listSalaryScalesResultSchema>;

// ---------------------------------------------------------------------------
// Inline CRUD schemas
// ---------------------------------------------------------------------------

export const createSalaryScaleSchema = z.object({
  salary_scale_name_en: z
    .string()
    .min(1, "Name (English) is required")
    .max(255, "Name must be at most 255 characters"),
  salary_scale_name_ar: z
    .string()
    .max(255, "Name (Arabic) must be at most 255 characters")
    .optional()
    .default(""),
  salary_scale_min_salary: z.coerce.number().min(0).optional(),
  salary_scale_mid_salary: z.coerce.number().min(0).optional(),
  salary_scale_max_salary: z.coerce.number().min(0).optional(),
  salary_scale_currency: z
    .string()
    .max(3)
    .optional()
    .default("KWD"),
  salary_scale_sort_order: z.coerce.number().int().optional(),
});

export type CreateSalaryScaleInput = z.input<typeof createSalaryScaleSchema>;
