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
// Types
// ---------------------------------------------------------------------------

export type ListStoresInput = z.input<typeof listStoresSchema>;
export type GetStoreInput = z.input<typeof getStoreSchema>;
export type CreateStoreInput = z.input<typeof createStoreSchema>;
export type UpdateStoreInput = z.input<typeof updateStoreSchema>;
export type DeleteStoreInput = z.input<typeof deleteStoreSchema>;

export type StoreRow = {
  store_id: number;
  store_name: string;
  store_location: string;
  store_status: number;
  store_total_candidates: number | null;
  company_name: string | null;
  brand_name: string | null;
  mall_name: string | null;
  manager_name: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type StoreDetail = {
  store: {
    store_id: number;
    store_name: string;
    store_location: string;
    store_status: number;
    store_total_candidates: number | null;
    store_created_at: string | null;
    store_updated_at: string | null;
    company: { company_name: string | null; company_email: string | null } | null;
    contact: { contact_name: string | null; contact_email: string | null } | null;
    brand: { brand_name_en: string | null } | null;
    mall: { mall_name_en: string | null } | null;
  } | null;
};

export type StoreActionResult = {
  success: boolean;
  storeId?: number;
  error?: string;
};

export type ListStoresResult = {
  items: StoreRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
