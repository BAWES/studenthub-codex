import { z } from "zod";

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single bank list item.
 */
export const bankItemSchema = z.object({
  bank_id: z.number().int().positive(),
  bank_name: z.string().nullable(),
  bank_iban_code: z.string(),
  bank_swift_code: z.string().nullable(),
  bank_code_abk: z.number().int().nullable(),
  bank_address: z.string().nullable(),
  bank_transfer_type: z.string().nullable(),
});

/**
 * Schema for the listBanks response.
 */
export const listBanksResultSchema = z.object({
  banks: z.array(bankItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

/**
 * Schema for the createBank response.
 */
export const bankOperationResultSchema = z.object({
  operation: z.string(),
  message: z.string(),
});

// ---------------------------------------------------------------------------
// Types derived from output schemas
// ---------------------------------------------------------------------------

export type BankItem = z.output<typeof bankItemSchema>;
export type ListBanksResult = z.output<typeof listBanksResultSchema>;
export type BankOperationResult = z.output<typeof bankOperationResultSchema>;
