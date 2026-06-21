import { z } from "zod";

// ---------------------------------------------------------------------------
// Get Store Detail
// ---------------------------------------------------------------------------

/**
 * Schema for fetching a store's detail by store ID.
 * The store_id is required and must be a positive integer.
 */
export const getStoreDetailSchema = z.object({
  storeId: z
    .number({ required_error: "Store ID is required", invalid_type_error: "Store ID must be a number" })
    .int("Store ID must be an integer")
    .positive("Store ID must be a positive integer"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GetStoreDetailInput = z.input<typeof getStoreDetailSchema>;
