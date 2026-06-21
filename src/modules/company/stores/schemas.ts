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

// ---------------------------------------------------------------------------
// Output validation schemas — validate server action return shapes
// ---------------------------------------------------------------------------

/** Schema for a single store list item */
export const storeListItemOutputSchema = z.object({
  store_id: z.number().int(),
  store_name: z.string(),
  store_location: z.string(),
  store_status: z.enum(["active", "inactive"]),
  mall_name: z.string().nullable(),
  brand_name: z.string().nullable(),
  manager_name: z.string().nullable(),
});

/** Schema for the paginated list result */
export const listStoresResultOutputSchema = z.object({
  stores: z.array(storeListItemOutputSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

/** Schema for a single store detail */
export const storeDetailOutputSchema = z.object({
  store_id: z.number().int(),
  store_name: z.string(),
  store_location: z.string(),
  store_status: z.enum(["active", "inactive"]),
  company_id: z.number().int().nullable(),
  company_name: z.string().nullable(),
  mall_name: z.string().nullable(),
  brand_name: z.string().nullable(),
  manager_name: z.string().nullable(),
  manager_email: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
}).nullable();

/** Schema for a DataTable store row */
export const storeRowOutputSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  location: z.string(),
  mallName: z.string(),
  brandName: z.string(),
  companyName: z.string(),
  managerName: z.string(),
});

/** Schema for malls and brands lookup result */
export const mallsAndBrandsResultOutputSchema = z.object({
  malls: z.array(z.object({
    uuid: z.string(),
    name: z.string(),
  })),
  brands: z.array(z.object({
    uuid: z.string(),
    name: z.string(),
  })),
});

/** Schema for a company select option */
export const companySelectOptionOutputSchema = z.object({
  id: z.number().int(),
  name: z.string(),
});

// ---------------------------------------------------------------------------
// Output types (inferred from schemas)
// ---------------------------------------------------------------------------

export type ListStoresResultOutput = z.output<typeof listStoresResultOutputSchema>;
export type StoreDetailOutput = z.output<typeof storeDetailOutputSchema>;
export type StoreRowOutput = z.output<typeof storeRowOutputSchema>;
export type MallsAndBrandsResultOutput = z.output<typeof mallsAndBrandsResultOutputSchema>;
export type CompanySelectOptionOutput = z.output<typeof companySelectOptionOutputSchema>;

export type StoreListItem = z.output<typeof storeListItemOutputSchema>;

export type StoreDetail = z.output<typeof storeDetailOutputSchema>;

export type ListStoresResult = z.output<typeof listStoresResultOutputSchema>;

/**
 * A flat display row for the DataTable in company/stores/page.tsx.
 */
export type StoreRow = z.output<typeof storeRowOutputSchema>;

export type MallsAndBrandsResult = z.output<typeof mallsAndBrandsResultOutputSchema>;

/**
 * A company option for the AddStoreForm dropdown.
 */
export type CompanySelectOption = z.output<typeof companySelectOptionOutputSchema>;
