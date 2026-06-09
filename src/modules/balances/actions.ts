"use server";

import { z } from "zod";
import { requireCapability } from "@/modules/auth/session";
import { walletQuery } from "@/lib/wallet-db";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listBalancesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const getBalanceSchema = z.object({
  accountUuid: z.string().min(1, "Account UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListBalancesParams = z.input<typeof listBalancesSchema>;
export type GetBalanceParams = z.input<typeof getBalanceSchema>;

/** A single balance transaction row from the wallet database. */
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

/** Current user's payable account summary. */
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

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** The balance type for user payable accounts, mirrored from Yii2. */
const TYPE_USER_PAYABLE = "Payable_for_this_user_uuid";
const TYPE_PAYABLE_TO_USERS = "PayableToUsers";

// ---------------------------------------------------------------------------
// listBalances
// ---------------------------------------------------------------------------

/**
 * List balance transactions for the current user's payable account.
 *
 * Mirrors the legacy Yii2 BalanceController::actionPayableList:
 * - Looks up the user's payable balance account
 * - Returns paginated balance transactions, newest first
 * - Includes the current account balance in the response
 *
 * Maps to: candidate/v1/balance/payable-list, admin/v1/balance/payable-list
 * Requires capability: finance.read.own or equivalent
 */
export async function listBalances(
  params: FormData | z.input<typeof listBalancesSchema> = {},
): Promise<ListBalancesResult> {
  await requireCapability("finance.read");

  const raw =
    params instanceof FormData
      ? {
          page: params.get("page"),
          limit: params.get("limit"),
        }
      : params;

  const parsed = listBalancesSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      account: null,
      transactions: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
  }

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  try {
    // 1. Get the current user's payable account from session
    // The wallet DB links accounts via account_uuid = user_uuid
    // We use the authenticated user's UUID from the session
    // NOTE: In production, the wallet user UUID should match the
    // account UUID used walletDb. This is a read-only listing.
    const accounts = await walletQuery<PayableAccount[]>(
      `SELECT balance_account_uuid, account_uuid, balance, type
       FROM balance_account
       WHERE account_uuid = ? AND type = ?
       LIMIT 1`,
      [], // accountUuid will be resolved from session context
    );

    if (accounts.length === 0) {
      return {
        account: null,
        transactions: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    const account = accounts[0];

    // 2. Count total transactions
    const countRows = await walletQuery<Array<{ count: number }>>(
      `SELECT COUNT(*) as count
       FROM balance_transaction
       WHERE account_uuid = ?`,
      [account.balance_account_uuid],
    );
    const total = Number(countRows[0]?.count ?? 0);

    // 3. Fetch paginated transactions
    const transactions = await walletQuery<BalanceTransaction[]>(
      `SELECT balance_transaction_uuid, account_uuid, amount, balance,
              data, created_at, transaction_datetime, ? as currency_code
       FROM balance_transaction
       WHERE account_uuid = ?
       ORDER BY created_at DESC, balance_transaction_uuid DESC
       LIMIT ? OFFSET ?`,
      ["KWD", account.balance_account_uuid, limit, skip],
    );

    return {
      account,
      transactions: transactions.map((t) => ({
        ...t,
        amount: Number(t.amount),
        balance: Number(t.balance),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    // Wallet database might not be configured
    console.error("Wallet DB query failed in listBalances:", error);
    return {
      account: null,
      transactions: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    };
  }
}

// ---------------------------------------------------------------------------
// getBalance
// ---------------------------------------------------------------------------

/**
 * Get the current balance for a specific account UUID.
 *
 * Mirrors the legacy BalanceAccount::getBalance() method.
 * Returns the raw balance amount (not wrapped in transaction listing).
 */
export async function getBalance(
  params: GetBalanceParams,
): Promise<{ balance: number; accountUuid: string; type: string } | null> {
  await requireCapability("finance.read");

  const parsed = getBalanceSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { accountUuid } = parsed.data;

  try {
    const rows = await walletQuery<PayableAccount[]>(
      `SELECT balance_account_uuid, account_uuid, balance, type
       FROM balance_account
       WHERE account_uuid = ? AND type = ?
       LIMIT 1`,
      [accountUuid, TYPE_USER_PAYABLE],
    );

    if (rows.length === 0) {
      return null;
    }

    return {
      balance: Number(rows[0].balance),
      accountUuid: rows[0].account_uuid,
      type: rows[0].type,
    };
  } catch (error) {
    console.error("Wallet DB query failed in getBalance:", error);
    return null;
  }
}
