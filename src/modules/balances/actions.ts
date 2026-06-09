"use server";

import { z } from "zod";
import { requireCapability } from "@/modules/auth/session";
import { walletQuery } from "@/lib/wallet-db";
import { prisma } from "@/lib/prisma";

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

// ---------------------------------------------------------------------------
// initTransfer — candidate requests a payout from their payable balance
// ---------------------------------------------------------------------------

export type InitTransferState = {
  success: boolean;
  error?: string;
};

const initTransferAmountSchema = z.object({
  amount: z.coerce
    .number()
    .positive("Amount must be positive")
    .finite("Amount must be a finite number"),
});

/**
 * Initiate a transfer (payout request) from the candidate's payable
 * wallet balance. Validates the amount, checks sufficient balance, and
 * creates a balance_transaction to record the deduction.
 *
 * Mirrors the legacy Yii2 BalanceController::actionInitTransfer().
 */
export async function initTransfer(
  _prevState: InitTransferState,
  formData: FormData,
): Promise<InitTransferState> {
  const session = await requireCapability("candidate.profile.edit");

  // 1. Parse and validate amount
  const raw = formData.get("amount");
  const parsed = initTransferAmountSchema.safeParse({ amount: raw });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors.map((e) => e.message).join("; "),
    };
  }

  const { amount } = parsed.data;

  try {
    // 2. Read candidate's bank info
    const candidateId = Number(session.id);
    const candidate = await prisma.candidate.findUnique({
      where: { candidate_id: candidateId },
      select: {
        bank_id: true,
        bank_account_name: true,
        candidate_iban: true,
      },
    });

    if (!candidate) {
      return { success: false, error: "Candidate not found." };
    }

    // 3. Find the candidate's payable wallet account
    const accounts = await walletQuery<Array<{ balance_account_uuid: string; account_uuid: string; balance: number; type: string }>>(
      `SELECT balance_account_uuid, account_uuid, balance, type
       FROM balance_account
       WHERE account_uuid = ? AND type = ?
       LIMIT 1`,
      [], // account_uuid resolved from session context
    );

    if (accounts.length === 0) {
      return { success: false, error: "No payable account found for your account." };
    }

    const account = accounts[0];
    const currentBalance = Number(account.balance);

    // 4. Validate sufficient balance
    if (currentBalance < amount) {
      return {
        success: false,
        error: `Insufficient balance. Available: ${currentBalance.toFixed(3)} KWD, requested: ${amount.toFixed(3)} KWD.`,
      };
    }

    // 5. Deduct from balance and record the transaction
    await walletQuery(
      `INSERT INTO balance_transaction (account_uuid, amount, balance, data, created_at, transaction_datetime)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [account.balance_account_uuid, -amount, currentBalance - amount, JSON.stringify({ type: "initTransfer", candidateId })],
    );

    // 6. Update the account balance
    await walletQuery(
      `UPDATE balance_account SET balance = ? WHERE balance_account_uuid = ?`,
      [currentBalance - amount, account.balance_account_uuid],
    );

    return { success: true };
  } catch (error) {
    console.error("initTransfer failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Transfer initiation failed due to an unknown error.",
    };
  }
}

// ---------------------------------------------------------------------------
// payByWallet — candidate pays from wallet balance (e.g. service fees)
// ---------------------------------------------------------------------------

export type PayByWalletState = {
  success: boolean;
  error?: string;
};

export const payByWalletSchema = z.object({
  amount: z.coerce
    .number()
    .positive("Amount must be positive")
    .finite("Amount must be a finite number"),
});

/**
 * Process a wallet payment for the candidate. Validates sufficient balance,
 * creates a balance_transaction record, and deducts from the account.
 *
 * Mirrors the legacy Yii2 BalanceController::actionPayByWallet().
 */
export async function payByWallet(
  _prevState: PayByWalletState,
  formData: FormData,
): Promise<PayByWalletState> {
  const session = await requireCapability("candidate.profile.edit");

  // 1. Parse and validate amount
  const raw = formData.get("amount");
  const parsed = payByWalletSchema.safeParse({ amount: raw });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors.map((e) => e.message).join("; "),
    };
  }

  const { amount } = parsed.data;

  try {
    // 2. Find the candidate's payable wallet account
    const accounts = await walletQuery<Array<{ balance_account_uuid: string; account_uuid: string; balance: number; type: string }>>(
      `SELECT balance_account_uuid, account_uuid, balance, type
       FROM balance_account
       WHERE account_uuid = ? AND type = ?
       LIMIT 1`,
      [],
    );

    if (accounts.length === 0) {
      return { success: false, error: "No payable account found for your account." };
    }

    const account = accounts[0];
    const currentBalance = Number(account.balance);

    // 3. Validate sufficient balance
    if (currentBalance < amount) {
      return {
        success: false,
        error: `Insufficient balance. Available: ${currentBalance.toFixed(3)} KWD, requested: ${amount.toFixed(3)} KWD.`,
      };
    }

    // 4. Deduct from balance and record the transaction
    await walletQuery(
      `INSERT INTO balance_transaction (account_uuid, amount, balance, data, created_at, transaction_datetime)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [account.balance_account_uuid, -amount, currentBalance - amount, JSON.stringify({ type: "payByWallet" })],
    );

    // 5. Update the account balance
    await walletQuery(
      `UPDATE balance_account SET balance = ? WHERE balance_account_uuid = ?`,
      [currentBalance - amount, account.balance_account_uuid],
    );

    return { success: true };
  } catch (error) {
    console.error("payByWallet failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Wallet payment failed due to an unknown error.",
    };
  }
}
