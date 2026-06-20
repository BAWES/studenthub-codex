import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

export const listBalancesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});
export const getBalanceSchema = z.object({
  accountUuid: z.string().min(1, "Account UUID is required"),
});
export const initTransferAmountSchema = z.object({
  amount: z.coerce
    .number()
    .positive("Amount must be positive")
    .finite("Amount must be a finite number"),
});
export const payByWalletSchema = z.object({
  toUuid: z.string().optional(),
  email: z.string().email("Invalid email format").optional(),
  username: z.string().optional(),
  amount: z.coerce
    .number()
    .positive("Amount must be positive")
    .finite("Amount must be a finite number"),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a wallet payable account.
 */
export const payableAccountSchema = z.object({
  balance_account_uuid: z.string(),
  account_uuid: z.string(),
  balance: z.number(),
  type: z.string(),
});

/**
 * Schema for a single balance transaction.
 */
export const balanceTransactionSchema = z.object({
  balance_transaction_uuid: z.string(),
  account_uuid: z.string(),
  amount: z.number(),
  balance: z.number(),
  data: z.string().nullable(),
  created_at: z.date().nullable(),
  transaction_datetime: z.date().nullable(),
  currency_code: z.string().nullable(),
});

/**
 * Schema for the listBalances response.
 */
export const listBalancesResultSchema = z.object({
  account: payableAccountSchema.nullable(),
  transactions: z.array(balanceTransactionSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

/**
 * Schema for the getBalance response (balance account or null).
 */
export const getBalanceResultSchema = z.object({
  balance: z.number(),
  accountUuid: z.string(),
  type: z.string(),
}).nullable();

/**
 * Schema for the initTransfer state response.
 */
export const initTransferStateSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});

/**
 * Schema for the payByWallet state response.
 */
export const payByWalletStateSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListBalancesParams = z.input<typeof listBalancesSchema>;
export type GetBalanceParams = z.input<typeof getBalanceSchema>;
export type BalanceTransaction = z.output<typeof balanceTransactionSchema>;
export type PayableAccount = z.output<typeof payableAccountSchema>;
export type ListBalancesResult = z.output<typeof listBalancesResultSchema>;
export type InitTransferState = z.output<typeof initTransferStateSchema>;
export type PayByWalletState = z.output<typeof payByWalletStateSchema>;
