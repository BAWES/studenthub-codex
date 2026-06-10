import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for src/modules/balances actions
// ---------------------------------------------------------------------------

export const listBalancesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});
export const getBalanceSchema = z.object({
  accountUuid: z.string().min(1, "Account UUID is required"),
});
export type ListBalancesParams = z.input<typeof listBalancesSchema>;
export type GetBalanceParams = z.input<typeof getBalanceSchema>;
export type BalanceTransaction = {
  balance_transaction_uuid: string;
  account_uuid: string;
  amount: number;
  balance: number;
  data: string | null;
  created_at: Date | null;
  transaction_datetime: Date | null;
  currency_code: string | null;
};
export type PayableAccount = {
  balance_account_uuid: string;
  account_uuid: string;
  balance: number;
  type: string;
};
export type ListBalancesResult = {
  account: PayableAccount | null;
  transactions: BalanceTransaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
export type InitTransferState = {
  success: boolean;
  error?: string;
};
export type PayByWalletState = {
  success: boolean;
  error?: string;
};
export const payByWalletSchema = z.object({
  toUuid: z.string().optional(),
  email: z.string().email("Invalid email format").optional(),
  username: z.string().optional(),
  amount: z.coerce
    .number()
    .positive("Amount must be positive")
    .finite("Amount must be a finite number"),
});
