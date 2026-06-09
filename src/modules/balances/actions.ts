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
  const session = await requireCapability("finance.read");

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
    // 1. Resolve wallet user UUID from the current user's email
    // Mirrors Yii2 WalletUser::findByEmail pattern:
    //   wallet DB has its own user table that maps email -> user_uuid
    const candidateId = Number(session.id);
    const candidate = await prisma.candidate.findUnique({
      where: { candidate_id: candidateId },
      select: { candidate_email: true },
    });

    if (!candidate?.candidate_email) {
      return {
        account: null,
        transactions: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    const walletUsers = await walletQuery<Array<{ user_uuid: string }>>(
      `SELECT user_uuid FROM user WHERE email = ? LIMIT 1`,
      [candidate.candidate_email],
    );

    if (walletUsers.length === 0) {
      return {
        account: null,
        transactions: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    const userUuid = walletUsers[0].user_uuid;

    // 2. Get the candidate's payable wallet account
    const accounts = await walletQuery<PayableAccount[]>(
      `SELECT balance_account_uuid, account_uuid, balance, type
       FROM balance_account
       WHERE account_uuid = ? AND type = ?
       LIMIT 1`,
      [userUuid, TYPE_USER_PAYABLE],
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
    // 2. Read candidate's email and bank info
    const candidateId = Number(session.id);
    const candidate = await prisma.candidate.findUnique({
      where: { candidate_id: candidateId },
      select: {
        candidate_email: true,
        bank_id: true,
        bank_account_name: true,
        candidate_iban: true,
      },
    });

    if (!candidate) {
      return { success: false, error: "Candidate not found." };
    }

    // 3. Look up the wallet user by email (mirrors Yii2 WalletUser::findByEmail)
    //    The wallet DB has its own user table that maps email → user_uuid.
    type WalletUser = { user_uuid: string; bank_uuid: string | null; bank_account_name: string | null; iban: string | null };
    const walletUsers = await walletQuery<WalletUser[]>(
      `SELECT user_uuid, bank_uuid, bank_account_name, iban
       FROM user
       WHERE email = ?
       LIMIT 1`,
      [candidate.candidate_email],
    );

    if (walletUsers.length === 0) {
      return { success: false, error: "No wallet account found for your email." };
    }

    const walletUser = walletUsers[0];

    // 4. Find the candidate's payable wallet account using the wallet user UUID
    const accounts = await walletQuery<Array<{ balance_account_uuid: string; account_uuid: string; balance: number; type: string }>>(
      `SELECT balance_account_uuid, account_uuid, balance, type
       FROM balance_account
       WHERE account_uuid = ? AND type = ?
       LIMIT 1`,
      [walletUser.user_uuid, TYPE_USER_PAYABLE],
    );

    if (accounts.length === 0) {
      return { success: false, error: "No payable account found for your account." };
    }

    const account = accounts[0];
    const currentBalance = Number(account.balance);

    // 5. Validate sufficient balance
    if (currentBalance < amount) {
      return {
        success: false,
        error: `Insufficient balance. Available: ${currentBalance.toFixed(3)} KWD, requested: ${amount.toFixed(3)} KWD.`,
      };
    }

    // 6. Deduct from balance and record the transaction
    await walletQuery(
      `INSERT INTO balance_transaction (account_uuid, amount, balance, data, created_at, transaction_datetime)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [account.balance_account_uuid, -amount, currentBalance - amount, JSON.stringify({ type: "initTransfer", candidateId })],
    );

    // 7. Update the account balance
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

// payByWallet — P2P wallet payment
// ---------------------------------------------------------------------------

export type PayByWalletState = {
  success: boolean;
  error?: string;
};


const payByWalletSchema = z.object({
  toUuid: z.string().optional(),
  email: z.string().email("Invalid email format").optional(),
  username: z.string().optional(),
  amount: z.coerce
    .number()
    .positive("Amount must be positive")
    .finite("Amount must be a finite number"),
});

/**

 * Pay another user from the candidate's wallet balance.
 *
 * Mirrors the legacy Yii2 BalanceController::actionPayByWallet().
 * Recipient can be identified by:
 *   - toUuid (wallet user UUID)
 *   - email (wallet user email)
 *   - username (wallet user username)
 *
 * Validates:
 *   - At least one recipient identifier is provided
 *   - Amount >= 0.001 (minimum transaction threshold)
 *   - Sender has sufficient balance
 *
 * Effects:
 *   - Deducts amount from sender's balance_account
 *   - Credits amount to recipient's balance_account
 *   - Creates balance_transaction records for both sides
 */
export async function payByWallet(
  _prevState: PayByWalletState,
  formData: FormData,
): Promise<PayByWalletState> {
  const session = await requireCapability("candidate.profile.edit");


  // 1. Parse and validate input
  const raw = {
    toUuid: (formData.get("toUuid") ?? "") as string,
    email: (formData.get("email") ?? "") as string,
    username: (formData.get("username") ?? "") as string,
    amount: (formData.get("amount") ?? "") as string,
  };

  const parsed = payByWalletSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors.map((e) => e.message).join("; "),
    };
  }


  const { toUuid, email, username, amount } = parsed.data;

  // 2. Validate at least one recipient identifier
  if (!toUuid && !email && !username) {
    return {
      success: false,
      error: "Recipient identifier required: provide toUuid, email, or username.",
    };
  }

  // 3. Validate minimum transaction amount (mirrors Yii2 threshold)
  if (amount < 0.001) {
    return {
      success: false,
      error: "Amount cannot be less than 0.001 KWD.",
    };
  }

  try {
    // 4. Find the current user's wallet record by email
    const candidateId = Number(session.id);
    const candidate = await prisma.candidate.findUnique({
      where: { candidate_id: candidateId },
      select: { candidate_email: true },
    });

    if (!candidate || !candidate.candidate_email) {
      return { success: false, error: "Candidate email not found." };
    }

    type WalletUser = { user_uuid: string; username: string };
    const senderUsers = await walletQuery<WalletUser[]>(
      `SELECT user_uuid, username FROM user WHERE email = ? LIMIT 1`,
      [candidate.candidate_email],
    );

    if (senderUsers.length === 0) {
      return { success: false, error: "No wallet account found for your email." };
    }

    const sender = senderUsers[0];

    // 5. Find the recipient wallet user
    let recipient: WalletUser | null = null;

    if (toUuid) {
      const toUsers = await walletQuery<WalletUser[]>(
        `SELECT user_uuid, username FROM user WHERE user_uuid = ? LIMIT 1`,
        [toUuid],
      );
      if (toUsers.length > 0) recipient = toUsers[0];
    } else if (email) {
      const toUsers = await walletQuery<WalletUser[]>(
        `SELECT user_uuid, username FROM user WHERE email = ? LIMIT 1`,
        [email],
      );
      if (toUsers.length > 0) recipient = toUsers[0];
    } else if (username) {
      const toUsers = await walletQuery<WalletUser[]>(
        `SELECT user_uuid, username FROM user WHERE username = ? LIMIT 1`,
        [username],
      );
      if (toUsers.length > 0) recipient = toUsers[0];
    }

    if (!recipient) {
      return { success: false, error: "Recipient not found." };
    }

    // Prevent self-payment
    if (recipient.user_uuid === sender.user_uuid) {
      return { success: false, error: "Cannot pay yourself." };
    }

    // 6. Find the sender's payable balance account
    const senderAccounts = await walletQuery<Array<{ balance_account_uuid: string; balance: number }>>(
      `SELECT balance_account_uuid, balance
       FROM balance_account
       WHERE account_uuid = ? AND type = ?
       LIMIT 1`,
      [sender.user_uuid, TYPE_USER_PAYABLE],
    );

    if (senderAccounts.length === 0) {
      return { success: false, error: "No payable account found." };
    }

    const senderAccount = senderAccounts[0];
    const currentBalance = Number(senderAccount.balance);

    // 7. Validate sufficient balance
    if (currentBalance < amount) {
      return {
        success: false,
        error: `Insufficient balance. Available: ${currentBalance.toFixed(3)} KWD, requested: ${amount.toFixed(3)} KWD.`,
      };
    }


    // 8. Ensure recipient has a payable balance account (create if not exists)
    await walletQuery(
      `INSERT IGNORE INTO balance_account (account_uuid, type, balance)
       VALUES (?, ?, 0)`,
      [recipient.user_uuid, TYPE_USER_PAYABLE],
    );

    // 9. Deduct from sender
    await walletQuery(
      `INSERT INTO balance_transaction (account_uuid, amount, balance, data, created_at, transaction_datetime)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [
        senderAccount.balance_account_uuid,
        -amount,
        currentBalance - amount,
        JSON.stringify({ type: "payByWallet", data: `Paid to ${recipient.username}`, recipientUuid: recipient.user_uuid }),
      ],
    );

    await walletQuery(
      `UPDATE balance_account SET balance = ? WHERE balance_account_uuid = ?`,
      [currentBalance - amount, senderAccount.balance_account_uuid],
    );

    // 10. Get recipient's current balance before crediting
    const recipientAccounts = await walletQuery<Array<{ balance_account_uuid: string; balance: number }>>(
      `SELECT balance_account_uuid, balance
       FROM balance_account
       WHERE account_uuid = ? AND type = ?
       LIMIT 1`,
      [recipient.user_uuid, TYPE_USER_PAYABLE],
    );

    const recipientAccount = recipientAccounts[0];
    const recipientCurrentBalance = Number(recipientAccount.balance);

    // 11. Credit recipient
    await walletQuery(
      `INSERT INTO balance_transaction (account_uuid, amount, balance, data, created_at, transaction_datetime)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [
        recipientAccount.balance_account_uuid,
        amount,
        recipientCurrentBalance + amount,
        JSON.stringify({ type: "payByWallet", data: `Received from ${sender.username}`, senderUuid: sender.user_uuid }),
      ],
    );

    await walletQuery(
      `UPDATE balance_account SET balance = ? WHERE balance_account_uuid = ?`,
      [recipientCurrentBalance + amount, recipientAccount.balance_account_uuid],
    );

    return { success: true };
  } catch (error) {
    console.error("payByWallet failed:", error);
    return {
      success: false,

      error: error instanceof Error ? error.message : "Payment failed due to an unknown error.",
    };
  }
}
