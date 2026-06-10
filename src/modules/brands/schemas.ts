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
export type ListBrandsParams = z.input<typeof listBrandsSchema>;
export type BrandListItem = {
  brand_uuid: string;
  company_id: number | null;
  brand_name_en: string;
  brand_name_ar: string;
  brand_logo: string | null;
};
export type ListBrandsResult = {
  brands: BrandListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
