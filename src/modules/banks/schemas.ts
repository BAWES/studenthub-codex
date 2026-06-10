import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for src/modules/banks actions
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

export type ListBanksParams = z.input<typeof listBanksSchema>;
export type GetBankParams = z.input<typeof getBankSchema>;
export type CreateBankParams = z.input<typeof createBankSchema>;

export type BankListItem = {
  bank_id: number;
  bank_name: string | null;
  bank_iban_code: string;
  bank_swift_code: string | null;
  bank_code_abk: number | null;
  bank_address: string | null;
  bank_transfer_type: string | null;
};
export type ListBanksResult = {
  banks: BankListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
export type CreateBankResult = {
  operation: string;
  message: string;
};
