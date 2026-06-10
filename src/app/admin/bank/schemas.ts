import { z } from "zod";

// ---------------------------------------------------------------------------
// Admin Bank — Zod schemas for server actions
// ---------------------------------------------------------------------------
// Ported from Yii2 admin/modules/v1/controllers/BankController.php
//
// Bank model fields (prisma bank):
//   bank_id            Int       @id @default(autoincrement())
//   bank_name          String?   @db.VarChar(100)
//   bank_iban_code     String    @db.VarChar(64)
//   bank_swift_code    String?   @db.VarChar(100)
//   bank_code_abk      Int?
//   bank_address       String?   @db.VarChar(100)
//   bank_transfer_type String?   @db.Char(3)
//   deleted            Int       @default(0) @db.SmallInt
// ---------------------------------------------------------------------------

// ---- listBanks ----

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

// ---- getBank ----

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

// ---- createBank ----

export const createBankSchema = z.object({
  bankName: z.string().min(1, "Bank name is required").max(100),
  bankIbanCode: z.string().min(1, "IBAN code is required").max(64),
  bankSwiftCode: z.string().max(100).optional().nullable(),
  bankCodeAbk: z.coerce.number().int().optional().nullable(),
  bankAddress: z.string().max(100).optional().nullable(),
  bankTransferType: z.string().max(3).optional().nullable(),
});
export type CreateBankInput = z.input<typeof createBankSchema>;

// ---- updateBank ----

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

// ---- deleteBank ----

export const deleteBankSchema = z.object({
  bankId: z.coerce.number().int().positive(),
});
export type DeleteBankInput = z.input<typeof deleteBankSchema>;

// ---- shared response types ----

export type BankActionResponse =
  | { operation: "success"; message: string; data?: BankDetail["bank"] }
  | { operation: "error"; message: string };
