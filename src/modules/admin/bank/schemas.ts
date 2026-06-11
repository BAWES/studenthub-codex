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

export const listBanksSchema = z.object({
  sortBy: z
    .enum(["bank_id", "bank_name", "bank_iban_code", "bank_swift_code"])
    .optional()
    .default("bank_name"),
  sortDir: z.enum(["asc", "desc"]).optional().default("asc"),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});
export const createBankSchema = z.object({
  name: z.string().min(1, "Bank name is required").max(100).optional(),
  swift_code: z.string().max(100).optional(),
  address: z.string().max(100).optional(),
  bank_iban_code: z.string().min(1, "IBAN code is required").max(64),
  type: z.string().max(3).optional(),
  bank_code_abk: z.coerce.number().int().optional(),
});