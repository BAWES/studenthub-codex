import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

export const listStoresSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  companyId: z.coerce.number().int().positive().optional(),
});

export const getStoreSchema = z.object({
  storeId: z.coerce.number().int().positive(),
});

// Input types
export type ListStoresInput = z.input<typeof listStoresSchema>;
export type GetStoreInput = z.input<typeof getStoreSchema>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const storeItemSchema = z.object({
  store_id: z.number(),
  store_name: z.string(),
  store_location: z.string(),
  store_status: z.number(),
  store_total_candidates: z.number().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const listStoresResultSchema = z.object({
  stores: z.array(storeItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

// Output types
export type StoreListItem = z.output<typeof storeItemSchema>;
export type ListStoresResult = z.output<typeof listStoresResultSchema>;
