import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for admin/stores actions
// ---------------------------------------------------------------------------

export const listStoresSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  companyId: z.coerce.number().int().positive().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  q: z.string().optional(),
});

export const getStoreSchema = z.object({
  storeId: z.coerce.number().int().positive(),
});

export const createStoreSchema = z.object({
  store_name: z.string().min(1, "Store name is required").max(255),
  store_location: z.string().min(1, "Store location is required").max(255),
  company_id: z.coerce.number().int().positive().optional(),
  store_manager_uuid: z.string().optional(),
  brand_uuid: z.string().optional(),
  mall_uuid: z.string().optional(),
});

export const updateStoreSchema = z.object({
  storeId: z.coerce.number().int().positive("Store ID is required"),
  store_name: z.string().min(1).max(255).optional(),
  store_location: z.string().min(1).max(255).optional(),
  company_id: z.coerce.number().int().positive().optional(),
  store_manager_uuid: z.string().optional(),
  brand_uuid: z.string().optional(),
  mall_uuid: z.string().optional(),
});

export const deleteStoreSchema = z.object({
  storeId: z.coerce.number().int().positive("Store ID is required"),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single store row in the listing.
 */
export const storeRowSchema = z.object({
  store_id: z.number().int().positive(),
  store_name: z.string().min(1),
  store_location: z.string().min(1),
  store_status: z.number().int(),
  store_total_candidates: z.number().int().nullable(),
  company_name: z.string().nullable(),
  brand_name: z.string().nullable(),
  mall_name: z.string().nullable(),
  manager_name: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

/**
 * Schema for the store detail response from getStore.
 */
export const storeDetailSchema = z.object({
  store: z
    .object({
      store_id: z.number().int().positive(),
      store_name: z.string().min(1),
      store_location: z.string().min(1),
      store_status: z.number().int(),
      store_total_candidates: z.number().int().nullable(),
      store_created_at: z.string().nullable(),
      store_updated_at: z.string().nullable(),
      company: z
        .object({
          company_name: z.string().nullable(),
          company_email: z.string().nullable(),
        })
        .nullable(),
      contact: z
        .object({
          contact_name: z.string().nullable(),
          contact_email: z.string().nullable(),
        })
        .nullable(),
      brand: z
        .object({
          brand_name_en: z.string().nullable(),
        })
        .nullable(),
      mall: z
        .object({
          mall_name_en: z.string().nullable(),
        })
        .nullable(),
    })
    .nullable(),
});

/**
 * Schema for the full list response from listStores.
 */
export const listStoresResultSchema = z.object({
  items: z.array(storeRowSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

/**
 * Schema for store mutation action responses (create, update, delete).
 */
export const storeActionResultSchema = z.object({
  success: z.boolean(),
  storeId: z.number().int().positive().optional(),
  error: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListStoresInput = z.input<typeof listStoresSchema>;
export type GetStoreInput = z.input<typeof getStoreSchema>;
export type CreateStoreInput = z.input<typeof createStoreSchema>;
export type UpdateStoreInput = z.input<typeof updateStoreSchema>;
export type DeleteStoreInput = z.input<typeof deleteStoreSchema>;

// Output types derived from Zod schemas
export type StoreRow = z.output<typeof storeRowSchema>;
export type StoreDetail = z.output<typeof storeDetailSchema>;
export type StoreActionResult = z.output<typeof storeActionResultSchema>;
export type ListStoresResult = z.output<typeof listStoresResultSchema>;
