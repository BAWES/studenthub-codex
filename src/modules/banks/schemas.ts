import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

export const listBanksSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export const getBankSchema = z.object({
  id: z.number().int().positive(),
});

export const createBankSchema = z.object({
  name: z.string().min(1, "Bank name is required"),
  ibanCode: z.string().min(1, "IBAN code is required"),
  swiftCode: z.string().optional(),
  address: z.string().optional(),
  transferType: z.string().optional(),
  codeAbk: z.number().int().optional(),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single bank item in the list response.
 */
export const bankListItemSchema = z.object({
  bank_id: z.number().int(),
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
  banks: z.array(bankListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  limit: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

/**
 * Schema for the getBank response — a single bank item or null.
 */
export const getBankResultSchema = bankListItemSchema.nullable();

/**
 * Schema for the createBank response.
 */
export const createBankResultSchema = z.object({
  operation: z.string(),
  message: z.string(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListBanksParams = z.input<typeof listBanksSchema>;
export type GetBankParams = z.input<typeof getBankSchema>;
export type CreateBankParams = z.input<typeof createBankSchema>;

export type BankListItem = z.output<typeof bankListItemSchema>;
export type ListBanksResult = z.output<typeof listBanksResultSchema>;
export type CreateBankResult = z.output<typeof createBankResultSchema>;
