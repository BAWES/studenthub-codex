import { z } from "zod";

// ---------------------------------------------------------------------------
// Candidate Transfers — output validation schemas
// ---------------------------------------------------------------------------

export const transferStatusSchema = z.enum(["pending", "approved", "rejected", "cancelled", "completed"]);
export type TransferStatus = z.output<typeof transferStatusSchema>;

export const transferTypeSchema = z.enum(["store", "company", "department", "location"]);
export type TransferType = z.output<typeof transferTypeSchema>;

export const transferItemSchema = z.object({
  transfer_uuid: z.string(),
  transfer_type: transferTypeSchema,
  status: transferStatusSchema,
  from_name: z.string(),
  to_name: z.string(),
  reason: z.string().nullable(),
  requested_at: z.string(),
  approved_at: z.string().nullable(),
  effective_date: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type TransferItem = z.output<typeof transferItemSchema>;

export const listTransfersResultSchema = z.object({
  transfers: z.array(transferItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});
export type ListTransfersResult = z.output<typeof listTransfersResultSchema>;

export const transferActionResultSchema = z.object({
  success: z.boolean(),
  transfer_uuid: z.string().optional(),
  error: z.string().optional(),
});
export type TransferActionResult = z.output<typeof transferActionResultSchema>;

export const transferDetailSchema = z.object({
  transfer_uuid: z.string(),
  transfer_type: transferTypeSchema,
  status: transferStatusSchema,
  candidate_name: z.string(),
  candidate_email: z.string(),
  from_id: z.string(),
  from_name: z.string(),
  to_id: z.string(),
  to_name: z.string(),
  reason: z.string().nullable(),
  notes: z.string().nullable(),
  requested_by: z.string(),
  approved_by: z.string().nullable(),
  requested_at: z.string(),
  approved_at: z.string().nullable(),
  effective_date: z.string().nullable(),
  completed_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type TransferDetail = z.output<typeof transferDetailSchema>;
