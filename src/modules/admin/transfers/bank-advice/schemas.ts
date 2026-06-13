import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for admin/transfers/bank-advice actions
// ---------------------------------------------------------------------------
// Move these OUT of actions.ts so the "use server" file only exports async
// functions — Next.js requires this for "use server" files.
// ---------------------------------------------------------------------------

export const listTransferBankAdvicesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const getTransferBankAdviceSchema = z.object({
  uuid: z.string().min(1, "Transfer bank advice UUID is required"),
});

export const createTransferBankAdviceSchema = z.object({
  file_path: z
    .string({ required_error: "File path is required" })
    .min(1, "File path is required")
    .max(255),
});

export const updateTransferBankAdviceSchema = z.object({
  uuid: z.string().min(1, "Transfer bank advice UUID is required"),
  file_path: z.string().min(1).max(255),
});

export const deleteTransferBankAdviceSchema = z.object({
  uuid: z.string().min(1, "Transfer bank advice UUID is required"),
});
