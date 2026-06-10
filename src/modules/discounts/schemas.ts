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
export type CreateDiscountInput = z.infer<typeof createDiscountSchema>;
export type ListDiscountsInput = z.infer<typeof listDiscountsSchema>;
export type ListDiscountsByApplicantInput = z.infer<typeof listDiscountsByApplicantSchema>;
export type DiscountListItem = {
  discount_uuid: string;
  category_id: number;
  company_id: number;
  store_id: number | null;
  description_en: string;
  description_ar: string;
  how_to_apply_en: string | null;
  how_to_apply_ar: string | null;
  image: string | null;
  valid_until: Date | null;
  created_at: Date | null;
};
export type ListDiscountsResult = {
  discounts: DiscountListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
