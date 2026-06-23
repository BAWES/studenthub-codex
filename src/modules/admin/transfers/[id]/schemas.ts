import { z } from "zod";

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

export const getTransferSchema = z.object({
  transferId: z.coerce
    .number({ required_error: "Transfer ID is required" })
    .int()
    .positive("Transfer ID must be a positive integer"),
});

export const updateTransferStatusSchema = z.object({
  transferId: z.coerce
    .number({ required_error: "Transfer ID is required" })
    .int()
    .positive("Transfer ID must be a positive integer"),
  action: z.enum(["approve", "reject"], {
    required_error: "Action must be 'approve' or 'reject'",
    invalid_type_error: "Action must be 'approve' or 'reject'",
  }),
  reason: z.string().max(500).optional().default(""),
});

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export type UpdateTransferStatusInput = z.input<typeof updateTransferStatusSchema>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/** Schema for the transfer existence check result. */
export const transferExistenceSchema = z
  .object({
    transfer_id: z.number().int().positive(),
    transfer_status: z.string().min(1),
  })
  .nullable();

/** Schema for the update transfer status response. */
export const transferStatusUpdateResultSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true) }),
  z.object({ success: z.literal(false), error: z.string() }),
]);
