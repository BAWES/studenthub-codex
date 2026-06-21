import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const transferListItemSchema = z.object({
  transfer_id: z.number(),
  company_id: z.number().nullable(),
  contract_uuid: z.string().nullable(),
  contract_type: z.string().nullable(),
  total: z.string().nullable(),
  company_total: z.string().nullable(),
  transfer_status: z.number(),
  currency_code: z.string().nullable(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export type TransferListItem = z.output<typeof transferListItemSchema>;

export const listTransfersResultSchema = z.object({
  transfers: z.array(transferListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().min(1).max(100),
  totalPages: z.number().int().nonnegative(),
});

export type ListTransfersResult = z.output<typeof listTransfersResultSchema>;
