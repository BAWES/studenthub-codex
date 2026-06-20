import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for the toggleCandidatePaidAction FormData.
 */
export const toggleCandidatePaidSchema = z.object({
  tc_id: z.coerce.number().int().positive("tc_id must be a positive integer"),
  transfer_id: z.coerce.number().int().positive("transfer_id must be a positive integer"),
});

/**
 * Schema for the toggleTransferStatusAction FormData.
 */
export const toggleTransferStatusSchema = z.object({
  transfer_id: z.coerce.number().int().positive("transfer_id must be a positive integer"),
});

/**
 * Schema for the markPaymentReceivedAction FormData.
 */
export const markPaymentReceivedSchema = z.object({
  transfer_id: z.coerce.number().int().positive("transfer_id must be a positive integer"),
  received_on: z.string().optional(),
});

/**
 * Schema for the deleteTransferAction FormData.
 */
export const deleteTransferSchema = z.object({
  transfer_id: z.coerce.number().int().positive("transfer_id must be a positive integer"),
});

// ---------------------------------------------------------------------------
// Output validation helper
// ---------------------------------------------------------------------------

/**
 * Valid notice values used in redirect query params after finance actions.
 */
export const financeNoticeSchema = z.enum([
  "paid-toggled",
  "status-toggled",
  "payment-received",
  "transfer-deleted",
  "invalid-params",
  "invalid-date",
  "not-found",
]);

export type FinanceNotice = z.output<typeof financeNoticeSchema>;
