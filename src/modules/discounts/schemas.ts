import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for src/modules/discounts actions
// ---------------------------------------------------------------------------

export const createDiscountSchema = z.object({
  category_id: z.number().int("Category ID must be an integer").positive(),
  company_id: z.number().int("Company ID must be an integer").positive(),
  store_id: z.number().int().positive().optional(),
  description_en: z
    .string({ required_error: "English description is required" })
    .min(1, "English description is required")
    .max(65535),
  description_ar: z
    .string({ required_error: "Arabic description is required" })
    .min(1, "Arabic description is required")
    .max(65535),
  how_to_apply_en: z.string().max(255).optional(),
  how_to_apply_ar: z.string().max(255).optional(),
  valid_until: z.string().datetime().optional(),
});
export const listDiscountsSchema = z.object({
  company_id: z.number().int().positive().optional(),
  category_id: z.number().int().positive().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});
export const listDiscountsByApplicantSchema = z.object({
  applicant_id: z
    .number({ required_error: "Applicant ID is required" })
    .int("Applicant ID must be an integer")
    .positive("Applicant ID must be positive"),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});
export type CreateDiscountInput = z.input<typeof createDiscountSchema>;
export type ListDiscountsInput = z.input<typeof listDiscountsSchema>;
export type ListDiscountsByApplicantInput = z.input<typeof listDiscountsByApplicantSchema>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single discount item returned from list operations.
 */
export const discountItemSchema = z.object({
  discount_uuid: z.string(),
  category_id: z.number().int(),
  company_id: z.number().int(),
  store_id: z.number().int().nullable(),
  description_en: z.string(),
  description_ar: z.string(),
  how_to_apply_en: z.string().nullable(),
  how_to_apply_ar: z.string().nullable(),
  image: z.string().nullable(),
  valid_until: z.date().nullable(),
  created_at: z.date().nullable(),
});

/**
 * Schema for the createDiscount response.
 */
export const createDiscountResultSchema = z.object({
  discount_uuid: z.string(),
});

/**
 * Schema for the listDiscounts / listDiscountsByApplicant response.
 */
export const listDiscountsResultSchema = z.object({
  discounts: z.array(discountItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

// ---------------------------------------------------------------------------
// Types derived from output schemas
// ---------------------------------------------------------------------------

export type DiscountListItem = z.output<typeof discountItemSchema>;
export type ListDiscountsResult = z.output<typeof listDiscountsResultSchema>;
export type CreateDiscountResult = z.output<typeof createDiscountResultSchema>;
