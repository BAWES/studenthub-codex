import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for admin/transfers actions
// ---------------------------------------------------------------------------
// Move these OUT of actions.ts so the "use server" file only exports async
// functions — Next.js requires this for "use server" files.
// ---------------------------------------------------------------------------

export const listTransfersSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  companyId: z.coerce.number().int().positive().optional(),
  status: z.coerce.number().int().optional(),
});

export const getTransferSchema = z.object({
  transferId: z.coerce.number().int().positive("Transfer ID is required"),
});

export const approveTransferSchema = z.object({
  transferId: z.coerce.number().int().positive("Transfer ID is required"),
});

export const rejectTransferSchema = z.object({
  transferId: z.coerce.number().int().positive("Transfer ID is required"),
  reason: z.string().min(1, "Reason is required").max(500),
});
