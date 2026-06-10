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
