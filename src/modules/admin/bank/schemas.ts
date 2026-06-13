import { z } from "zod";

// ---------------------------------------------------------------------------
// listBanks schemas
// ---------------------------------------------------------------------------

export const listBanksSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  q: z.string().optional(),
});
export type ListBanksInput = z.input<typeof listBanksSchema>;

export interface BankRow {
  bank_id: number;
  bank_name: string | null;
  bank_iban_code: string;
  bank_swift_code: string | null;
  bank_code_abk: number | null;
  bank_address: string | null;
  bank_transfer_type: string | null;
  candidate_count: number;
  created_at: string | null;
}

// ---- Output validation for listBanks ----

export const bankRowOutputSchema = z.object({
  bank_id: z.number().int(),
  bank_name: z.string().nullable(),
  bank_iban_code: z.string(),
  bank_swift_code: z.string().nullable(),
  bank_code_abk: z.number().int().nullable(),
  bank_address: z.string().nullable(),
  bank_transfer_type: z.string().nullable(),
  candidate_count: z.number().int().nonnegative(),
  created_at: z.string().nullable(),
});

export const listBanksOutputSchema = z.object({
  items: z.array(bankRowOutputSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

// ---------------------------------------------------------------------------
// getBank schemas
// ---------------------------------------------------------------------------

export const getBankSchema = z.object({
  bankId: z.coerce.number().int().positive(),
});
export type GetBankInput = z.input<typeof getBankSchema>;

export interface BankDetail {
  bank: {
    bank_id: number;
    bank_name: string | null;
    bank_iban_code: string;
    bank_swift_code: string | null;
    bank_code_abk: number | null;
    bank_address: string | null;
    bank_transfer_type: string | null;
  };
  candidate_count: number;
}

// ---- Output validation for getBank ----

export const bankObjectOutputSchema = z.object({
  bank_id: z.number().int(),
  bank_name: z.string().nullable(),
  bank_iban_code: z.string(),
  bank_swift_code: z.string().nullable(),
  bank_code_abk: z.number().int().nullable(),
  bank_address: z.string().nullable(),
  bank_transfer_type: z.string().nullable(),
});

export const bankDetailOutputSchema = z.object({
  bank: bankObjectOutputSchema.nullable(),
  candidate_count: z.number().int().nonnegative(),
});

// ---------------------------------------------------------------------------
// createBank schemas
// ---------------------------------------------------------------------------

export const createBankSchema = z.object({
  bankName: z.string().min(1, "Bank name is required").max(100),
  bankIbanCode: z.string().min(1, "IBAN code is required").max(64),
  bankSwiftCode: z.string().max(100).optional().nullable(),
  bankCodeAbk: z.coerce.number().int().optional().nullable(),
  bankAddress: z.string().max(100).optional().nullable(),
  bankTransferType: z.string().max(3).optional().nullable(),
});
export type CreateBankInput = z.input<typeof createBankSchema>;

// ---------------------------------------------------------------------------
// updateBank schemas
// ---------------------------------------------------------------------------

export const updateBankSchema = z.object({
  bankId: z.coerce.number().int().positive(),
  bankName: z.string().min(1).max(100).optional(),
  bankIbanCode: z.string().min(1).max(64).optional(),
  bankSwiftCode: z.string().max(100).optional().nullable(),
  bankCodeAbk: z.coerce.number().int().optional().nullable(),
  bankAddress: z.string().max(100).optional().nullable(),
  bankTransferType: z.string().max(3).optional().nullable(),
});
export type UpdateBankInput = z.input<typeof updateBankSchema>;

// ---------------------------------------------------------------------------
// deleteBank schemas
// ---------------------------------------------------------------------------

export const deleteBankSchema = z.object({
  bankId: z.coerce.number().int().positive(),
});
export type DeleteBankInput = z.input<typeof deleteBankSchema>;

// ---------------------------------------------------------------------------
// Shared response types
// ---------------------------------------------------------------------------

export type BankActionResponse =
  | { operation: "success"; message: string; data?: BankDetail["bank"] }
  | { operation: "error"; message: string };

// ---- Output validation for mutations ----

export const bankMutationOutputSchema = z.object({
  operation: z.literal("success").or(z.literal("error")),
  message: z.string(),
  data: bankObjectOutputSchema.optional(),
});

// ---------------------------------------------------------------------------
// Legacy/compat output schemas (used by module-internal exports)
// ---------------------------------------------------------------------------

export const bankItemSchema = z.object({
  bank_id: z.number().int().positive(),
  bank_name: z.string().nullable(),
  bank_iban_code: z.string(),
  bank_swift_code: z.string().nullable(),
  bank_code_abk: z.number().int().nullable(),
  bank_address: z.string().nullable(),
  bank_transfer_type: z.string().nullable(),
});

export const listBanksResultSchema = z.object({
  banks: z.array(bankItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export const bankOperationResultSchema = z.object({
  operation: z.string(),
  message: z.string(),
});

export type BankItem = z.output<typeof bankItemSchema>;
export type ListBanksResult = z.output<typeof listBanksResultSchema>;
export type BankOperationResult = z.output<typeof bankOperationResultSchema>;
