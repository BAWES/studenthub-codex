import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const storeAssignmentRequestItemSchema = z.object({
  sar_uuid: z.string(),
  candidate_id: z.number().nullable(),
  store_id: z.number().nullable(),
  currency_code: z.string().nullable(),
  status: z.number().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export type StoreAssignmentRequestItem = z.output<
  typeof storeAssignmentRequestItemSchema
>;

export const listStoreAssignmentRequestsResultSchema = z.object({
  items: z.array(storeAssignmentRequestItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().min(1).max(100),
});

export type ListStoreAssignmentRequestsResult = z.output<
  typeof listStoreAssignmentRequestsResultSchema
>;

export const createStoreAssignmentRequestResultSchema = z.object({
  operation: z.string(),
  message: z.string(),
  sar_uuid: z.string().optional(),
});

export type CreateStoreAssignmentRequestResult = z.output<
  typeof createStoreAssignmentRequestResultSchema
>;
