import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for admin/transfers/[id] actions
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
// Types
// ---------------------------------------------------------------------------

export type UpdateTransferStatusInput = z.input<typeof updateTransferStatusSchema>;

export type UpdateTransferStatusResponse = {
  success: boolean;
  error?: string;
};
