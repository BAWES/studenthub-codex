import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for src/modules/brands actions
// ---------------------------------------------------------------------------

export const listBrandsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});
export const getBrandSchema = z.object({
  uuid: z.string().min(1, "Brand UUID is required"),
});
// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single brand item returned from listBrands / getBrand.
 */
export const brandItemSchema = z.object({
  brand_uuid: z.string(),
  company_id: z.number().int().nullable(),
  brand_name_en: z.string(),
  brand_name_ar: z.string(),
  brand_logo: z.string().nullable(),
});

/**
 * Schema for getBrand result (item or null).
 */
export const brandDetailSchema = brandItemSchema.nullable();

/**
 * Schema for the listBrands response.
 */
export const listBrandsResultSchema = z.object({
  brands: z.array(brandItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListBrandsParams = z.input<typeof listBrandsSchema>;
export type BrandListItem = z.output<typeof brandItemSchema>;
export type ListBrandsResult = z.output<typeof listBrandsResultSchema>;
