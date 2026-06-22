import { z } from "zod";

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single business development (company_request) item.
 */
export const businessDevelopmentItemSchema = z.object({
  company_request_uuid: z.string(),
  company_name: z.string(),
  company_email: z.string(),
  contact_name: z.string(),
  contact_position: z.string().nullable(),
  phone_number: z.string().nullable(),
  requesting_for: z.string().nullable(),
  status: z.boolean().nullable(),
  country_id: z.number().int().nullable(),
  currency_code: z.string().nullable(),
  country_name_en: z.string().nullable(),
  country_name_ar: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});
export type BusinessDevelopmentItem = z.output<typeof businessDevelopmentItemSchema>;

/**
 * Schema for the listBusinessDevelopments response.
 */
export const listBusinessDevelopmentsResultSchema = z.object({
  items: z.array(businessDevelopmentItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});
export type ListBusinessDevelopmentsResult = z.output<typeof listBusinessDevelopmentsResultSchema>;

/**
 * Schema for mutation responses (create/update/delete).
 */
export const businessDevelopmentActionResultSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true), uuid: z.string() }),
  z.object({ success: z.literal(false), error: z.string() }),
]);
export type BusinessDevelopmentActionResult = z.output<typeof businessDevelopmentActionResultSchema>;
