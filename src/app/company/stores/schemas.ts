import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listStoresSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  company_id: z.number().int().positive().optional(),
  store_status: z.number().int().optional(),
});

export const getStoreSchema = z.object({
  store_id: z.number().int().positive("Store ID must be a positive integer"),
});

/**
 * Schema for listing stores as DataTable rows.
 * Mirrors getCompanyStoresRows from @/modules/company/data.
 */
export const listStoresRowsSchema = z.object({
  contactUuid: z.string().min(1, "Contact UUID is required"),
});

/**
 * Schema for fetching malls and brands for the AddStoreForm dropdowns.
 * Mirrors getCompanyMallsAndBrands from @/modules/company/data.
 */
export const listMallsAndBrandsSchema = z.object({
  contactUuid: z.string().min(1, "Contact UUID is required"),
});

/**
 * Schema for listing company select options for the AddStoreForm.
 * Mirrors getCompanySelectOptions from @/modules/company/data.
 */
export const listCompanySelectOptionsSchema = z.object({
  contactUuid: z.string().min(1, "Contact UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListStoresInput = z.input<typeof listStoresSchema>;

export type StoreListItem = {
  store_id: number;
  store_name: string;
  store_location: string;
  mall_name: string | null;
  brand_name: string | null;
  manager_name: string | null;
  store_status: "active" | "inactive";
};

export type StoreDetail = {
  store_id: number;
  store_name: string;
  store_location: string;
  store_status: "active" | "inactive";
  company_id: number | null;
  company_name: string | null;
  mall_name: string | null;
  brand_name: string | null;
  manager_name: string | null;
  manager_email: string | null;
  created_at: string;
  updated_at: string;
};

export type ListStoresResult = {
  stores: StoreListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

/**
 * A flat display row for the DataTable in company/stores/page.tsx.
 */
export type StoreRow = {
  id: number;
  name: string;
  location: string;
  mallName: string;
  brandName: string;
  companyName: string;
  managerName: string;
};

export type MallsAndBrandsResult = {
  malls: { uuid: string; name: string }[];
  brands: { uuid: string; name: string }[];
};

/**
 * A company option for the AddStoreForm dropdown.
 */
export type CompanySelectOption = {
  id: number;
  name: string;
};
