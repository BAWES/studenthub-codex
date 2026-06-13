import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas — modules/banks
// ---------------------------------------------------------------------------

export const bankItemSchema = z.object({
  bank_id: z.number(),
  bank_name: z.string().nullable(),
  bank_iban_code: z.string(),
  bank_swift_code: z.string().nullable(),
  bank_code_abk: z.number().int().nullable(),
  bank_address: z.string().nullable(),
  bank_transfer_type: z.string().nullable(),
});

export type BankItem = z.output<typeof bankItemSchema>;

export const listBanksResultSchema = z.object({
  banks: z.array(bankItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().min(1).max(100),
  totalPages: z.number().int().nonnegative(),
});

export type ListBanksResult = z.output<typeof listBanksResultSchema>;

export const getBankResultSchema = bankItemSchema;

export type GetBankResult = z.output<typeof getBankResultSchema>;

export const createBankResultSchema = z.object({
  bank: bankItemSchema,
});

export type CreateBankResult = z.output<typeof createBankResultSchema>;
