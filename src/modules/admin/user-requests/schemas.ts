import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for admin/user-requests actions
// ---------------------------------------------------------------------------
// DB table: store_assignment_request
// PK:       sar_uuid (String @db.Char(60))
// FK:       candidate_id -> candidate.candidate_id
// FK:       store_id -> store.store_id
// Fields:   currency_code, status (TinyInt 0/1), created_at, updated_at
//
// Prisma model: store_assignment_request (auto-generated from schema)
// Relations:
//   - candidate?: candidate @relation(fields: [candidate_id], references: [candidate_id])
//   - store?: store        @relation(fields: [store_id], references: [store_id])
// ---------------------------------------------------------------------------

export const listStoreAssignmentRequestsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  candidateId: z.coerce.number().int().positive().optional(),
  storeId: z.coerce.number().int().positive().optional(),
  status: z.enum(["pending", "approved"]).optional(),
});

export const getStoreAssignmentRequestSchema = z.object({
  sarUuid: z.string().min(1, "SAR UUID is required"),
});

export const updateStoreAssignmentRequestStatusSchema = z.object({
  sarUuid: z.string().min(1, "SAR UUID is required"),
  status: z.enum(["pending", "approved"]),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single store assignment request row in the listing.
 */
export const storeAssignmentRequestRowSchema = z.object({
  sar_uuid: z.string().min(1),
  candidate_id: z.number().int().nullable(),
  candidate_name: z.string().nullable(),
  store_id: z.number().int().nullable(),
  store_name: z.string().nullable(),
  currency_code: z.string().nullable(),
  status: z.number().int().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

/**
 * Schema for the full list response from listStoreAssignmentRequests.
 */
export const listStoreAssignmentRequestsOutputSchema = z.object({
  items: z.array(storeAssignmentRequestRowSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export type ListStoreAssignmentRequestsOutput = z.output<typeof listStoreAssignmentRequestsOutputSchema>;

/**
 * Schema for a single store assignment request detail (same shape as row).
 */
export const getStoreAssignmentRequestOutputSchema = z.object({
  request: storeAssignmentRequestRowSchema.nullable(),
});

export type GetStoreAssignmentRequestOutput = z.output<typeof getStoreAssignmentRequestOutputSchema>;

/**
 * Schema for status update action response.
 */
const storeAssignmentActionResponseSchema = z.object({
  operation: z.enum(["success", "error"]),
  message: z.string().min(1),
});

export const updateStoreAssignmentRequestStatusOutputSchema = storeAssignmentActionResponseSchema;

export type UpdateStoreAssignmentRequestStatusOutput = z.output<typeof updateStoreAssignmentRequestStatusOutputSchema>;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListStoreAssignmentRequestsInput = z.input<typeof listStoreAssignmentRequestsSchema>;
export type GetStoreAssignmentRequestInput = z.input<typeof getStoreAssignmentRequestSchema>;
export type UpdateStoreAssignmentRequestStatusInput = z.input<typeof updateStoreAssignmentRequestStatusSchema>;

export type StoreAssignmentRequestRow = {
  sar_uuid: string;
  candidate_id: number | null;
  candidate_name: string | null;
  store_id: number | null;
  store_name: string | null;
  currency_code: string | null;
  status: number | null;
  created_at: string | null;
  updated_at: string | null;
};

export type StoreAssignmentRequestDetail = {
  request: StoreAssignmentRequestRow | null;
};

export type UpdateStoreAssignmentRequestStatusResult = {
  operation: "success" | "error";
  message: string;
};
