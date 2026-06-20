"use server";

import { z } from "zod";
import { requireCapability } from "@/modules/auth/session";
import { walletQuery } from "@/lib/wallet-db";
import { prisma } from "@/lib/prisma";
import {
  listBalancesSchema,
  getBalanceSchema,
  initTransferAmountSchema,
  payByWalletSchema,
  listBalancesResultSchema,
  getBalanceResultSchema,
  initTransferStateSchema,
  payByWalletStateSchema,
  type ListBalancesParams,
  type GetBalanceParams,
  type BalanceTransaction,
  type PayableAccount,
  type ListBalancesResult,
  type InitTransferState,
  type PayByWalletState,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Resolve a wallet user UUID from a session email.
 * Mirrors Yii2 WalletUser::findByEmail().
 * Returns null when no mapping exists or the query fails.
 */
export async function resolveWalletAccountUuid(
  email: string,
): Promise<string | null> {
  try {
    const rows = await walletQuery<Array<{ user_uuid: string }>>(
      `SELECT user_uuid FROM user WHERE email = ? LIMIT 1`,
      [email],
    );
    return rows.length > 0 ? rows[0].user_uuid : null;
  } catch (error) {
    console.error("Wallet UUID resolution failed:", error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** The balance type for user payable accounts, mirrored from Yii2. */
const TYPE_USER_PAYABLE = "Payable_for_this_user_uuid";

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
    const walletUuid = await resolveWalletAccountUuid(session.email);
    if (!walletUuid) {
      return {
        account: null,
        transactions: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    // 2. Get the candidate's payable wallet account
    const accounts = await walletQuery<PayableAccount[]>(
      `SELECT balance_account_uuid, account_uuid, balance, type
       FROM balance_account
       WHERE account_uuid = ? AND type = ?
       LIMIT 1`,
      [walletUuid, TYPE_USER_PAYABLE],
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

    // 3. Count total transactions
    const countRows = await walletQuery<Array<{ count: number }>>(
      `SELECT COUNT(*) as count
       FROM balance_transaction
       WHERE account_uuid = ?`,
      [account.balance_account_uuid],
    );
    const total = Number(countRows[0]?.count ?? 0);

    // 4. Fetch paginated transactions
    const transactions = await walletQuery<BalanceTransaction[]>(
      `SELECT balance_transaction_uuid, account_uuid, amount, balance,
              data, created_at, transaction_datetime, ? as currency_code
       FROM balance_transaction
       WHERE account_uuid = ?
       ORDER BY created_at DESC, balance_transaction_uuid DESC
       LIMIT ? OFFSET ?`,
      ["KWD", account.balance_account_uuid, limit, skip],
    );

    const result = {
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

    // Validate output shape
    const listBalancesOutput = listBalancesResultSchema.safeParse(result);
    if (!listBalancesOutput.success) {
      console.error(
        "[modules/balances] listBalances output validation failed:",
        listBalancesOutput.error.issues,
      );
    }

    return result;
  } catch (error) {
    // Wallet database might not be configured
    console.error("Wallet DB query failed in listBalances:", error);
    const errorResult = {
      account: null,
      transactions: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    };

    // Validate output shape
    const listBalancesErrorOutput = listBalancesResultSchema.safeParse(errorResult);
    if (!listBalancesErrorOutput.success) {
      console.error(
        "[modules/balances] listBalances error output validation failed:",
        listBalancesErrorOutput.error.issues,
      );
    }

    return errorResult;
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
      const nullBalResult: null = null;

      // Validate output shape
      const getBalOutput = getBalanceResultSchema.safeParse(nullBalResult);
      if (!getBalOutput.success) {
        console.error(
          "[modules/balances] getBalance output validation failed:",
          getBalOutput.error.issues,
        );
      }

      return nullBalResult;
    }

    const balResult = {
      balance: Number(rows[0].balance),
      accountUuid: rows[0].account_uuid,
      type: rows[0].type,
    };

    // Validate output shape
    const getBalOutput = getBalanceResultSchema.safeParse(balResult);
    if (!getBalOutput.success) {
      console.error(
        "[modules/balances] getBalance output validation failed:",
        getBalOutput.error.issues,
      );
    }

    return balResult;
  } catch (error) {
    console.error("Wallet DB query failed in getBalance:", error);
    const catchBalResult: null = null;

    // Validate output shape
    const catchBalOutput = getBalanceResultSchema.safeParse(catchBalResult);
    if (!catchBalOutput.success) {
      console.error(
        "[modules/balances] getBalance output validation failed:",
        catchBalOutput.error.issues,
      );
    }

    return catchBalResult;
  }
}

// ---------------------------------------------------------------------------
// initTransfer — candidate requests a payout from their payable balance
// ---------------------------------------------------------------------------

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
    const validationError: InitTransferState = {
      success: false,
      error: parsed.error.errors.map((e) => e.message).join("; "),
    };

    // Validate output shape
    const initValOutput = initTransferStateSchema.safeParse(validationError);
    if (!initValOutput.success) {
      console.error(
        "[modules/balances] initTransfer output validation failed:",
        initValOutput.error.issues,
      );
    }

    return validationError;
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
      const noCandidateResult: InitTransferState = { success: false, error: "Candidate not found." };

      // Validate output shape
      const initNoCandOutput = initTransferStateSchema.safeParse(noCandidateResult);
      if (!initNoCandOutput.success) {
        console.error(
          "[modules/balances] initTransfer output validation failed:",
          initNoCandOutput.error.issues,
        );
      }

      return noCandidateResult;
    }

    // 3. Resolve the wallet user UUID from the session email
    const walletUuid = await resolveWalletAccountUuid(candidate.candidate_email);
    if (!walletUuid) {
      const noWalletResult: InitTransferState = { success: false, error: "No wallet account found for your email." };

      // Validate output shape
      const initNoWalletOutput = initTransferStateSchema.safeParse(noWalletResult);
      if (!initNoWalletOutput.success) {
        console.error(
          "[modules/balances] initTransfer output validation failed:",
          initNoWalletOutput.error.issues,
        );
      }

      return noWalletResult;
    }

    // 4. Find the candidate's payable wallet account
    const accounts = await walletQuery<Array<{ balance_account_uuid: string; account_uuid: string; balance: number; type: string }>>(
      `SELECT balance_account_uuid, account_uuid, balance, type
       FROM balance_account
       WHERE account_uuid = ? AND type = ?
       LIMIT 1`,
      [walletUuid, TYPE_USER_PAYABLE],
    );

    if (accounts.length === 0) {
      const noPayableResult: InitTransferState = { success: false, error: "No payable account found for your account." };

      // Validate output shape
      const initNoPayableOutput = initTransferStateSchema.safeParse(noPayableResult);
      if (!initNoPayableOutput.success) {
        console.error(
          "[modules/balances] initTransfer output validation failed:",
          initNoPayableOutput.error.issues,
        );
      }

      return noPayableResult;
    }

    const account = accounts[0];
    const currentBalance = Number(account.balance);

    // 5. Validate sufficient balance
    if (currentBalance < amount) {
      const insufficientResult: InitTransferState = {
        success: false,
        error: `Insufficient balance. Available: ${currentBalance.toFixed(3)} KWD, requested: ${amount.toFixed(3)} KWD.`,
      };

      // Validate output shape
      const initInsufficientOutput = initTransferStateSchema.safeParse(insufficientResult);
      if (!initInsufficientOutput.success) {
        console.error(
          "[modules/balances] initTransfer output validation failed:",
          initInsufficientOutput.error.issues,
        );
      }

      return insufficientResult;
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

    const successResult: InitTransferState = { success: true };

    // Validate output shape
    const initSuccessOutput = initTransferStateSchema.safeParse(successResult);
    if (!initSuccessOutput.success) {
      console.error(
        "[modules/balances] initTransfer output validation failed:",
        initSuccessOutput.error.issues,
      );
    }

    return successResult;
  } catch (error) {
    console.error("initTransfer failed:", error);
    const catchResult: InitTransferState = {
      success: false,
      error: error instanceof Error ? error.message : "Transfer initiation failed due to an unknown error.",
    };

    // Validate output shape
    const initCatchOutput = initTransferStateSchema.safeParse(catchResult);
    if (!initCatchOutput.success) {
      console.error(
        "[modules/balances] initTransfer output validation failed:",
        initCatchOutput.error.issues,
      );
    }

    return catchResult;
  }
}

// ---------------------------------------------------------------------------
// payByWallet — P2P wallet payment
// ---------------------------------------------------------------------------

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
    const parseError: PayByWalletState = {
      success: false,
      error: parsed.error.errors.map((e) => e.message).join("; "),
    };

    // Validate output shape
    const payByParseOutput = payByWalletStateSchema.safeParse(parseError);
    if (!payByParseOutput.success) {
      console.error(
        "[modules/balances] payByWallet output validation failed:",
        payByParseOutput.error.issues,
      );
    }

    return parseError;
  }

  const { toUuid, email, username, amount } = parsed.data;

  // 2. Validate at least one recipient identifier
  if (!toUuid && !email && !username) {
    const noRecipientResult: PayByWalletState = {
      success: false,
      error: "Recipient identifier required: provide toUuid, email, or username.",
    };

    // Validate output shape
    const payByNoRecOutput = payByWalletStateSchema.safeParse(noRecipientResult);
    if (!payByNoRecOutput.success) {
      console.error(
        "[modules/balances] payByWallet output validation failed:",
        payByNoRecOutput.error.issues,
      );
    }

    return noRecipientResult;
  }

  // 3. Validate minimum transaction amount (mirrors Yii2 threshold)
  if (amount < 0.001) {
    const minAmountResult: PayByWalletState = {
      success: false,
      error: "Amount cannot be less than 0.001 KWD.",
    };

    // Validate output shape
    const payByMinAmountOutput = payByWalletStateSchema.safeParse(minAmountResult);
    if (!payByMinAmountOutput.success) {
      console.error(
        "[modules/balances] payByWallet output validation failed:",
        payByMinAmountOutput.error.issues,
      );
    }

    return minAmountResult;
  }

  try {
    // 4. Find the current user's payable wallet account via email
    const walletUuid = await resolveWalletAccountUuid(session.email);
    if (!walletUuid) {
      const noWalletResult2: PayByWalletState = { success: false, error: "No payable account found for your account." };

      // Validate output shape
      const payByNoWalletOutput = payByWalletStateSchema.safeParse(noWalletResult2);
      if (!payByNoWalletOutput.success) {
        console.error(
          "[modules/balances] payByWallet output validation failed:",
          payByNoWalletOutput.error.issues,
        );
      }

      return noWalletResult2;
    }

    // 5. Get the sender's payable balance account
    const senderAccounts = await walletQuery<Array<{ balance_account_uuid: string; balance: number; account_uuid: string }>>(
      `SELECT balance_account_uuid, account_uuid, balance
       FROM balance_account
       WHERE account_uuid = ? AND type = ?
       LIMIT 1`,
      [walletUuid, TYPE_USER_PAYABLE],
    );

    if (senderAccounts.length === 0) {
      const noSenderResult: PayByWalletState = { success: false, error: "No payable account found." };

      // Validate output shape
      const payByNoSenderOutput = payByWalletStateSchema.safeParse(noSenderResult);
      if (!payByNoSenderOutput.success) {
        console.error(
          "[modules/balances] payByWallet output validation failed:",
          payByNoSenderOutput.error.issues,
        );
      }

      return noSenderResult;
    }

    const senderAccount = senderAccounts[0];
    const senderBalance = Number(senderAccount.balance);

    // 6. Find the recipient wallet user
    type WalletUser = { user_uuid: string; username: string };
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
      const noRecipResult: PayByWalletState = { success: false, error: "Recipient not found." };

      // Validate output shape
      const payByNoRecipOutput = payByWalletStateSchema.safeParse(noRecipResult);
      if (!payByNoRecipOutput.success) {
        console.error(
          "[modules/balances] payByWallet output validation failed:",
          payByNoRecipOutput.error.issues,
        );
      }

      return noRecipResult;
    }

    // Prevent self-payment
    if (recipient.user_uuid === walletUuid) {
      const selfPayResult: PayByWalletState = { success: false, error: "Cannot pay yourself." };

      // Validate output shape
      const payBySelfPayOutput = payByWalletStateSchema.safeParse(selfPayResult);
      if (!payBySelfPayOutput.success) {
        console.error(
          "[modules/balances] payByWallet output validation failed:",
          payBySelfPayOutput.error.issues,
        );
      }

      return selfPayResult;
    }

    // 7. Validate sufficient balance
    if (senderBalance < amount) {
      const insufficientBalResult: PayByWalletState = {
        success: false,
        error: `Insufficient balance. Available: ${senderBalance.toFixed(3)} KWD, requested: ${amount.toFixed(3)} KWD.`,
      };

      // Validate output shape
      const payByInsufficientOutput = payByWalletStateSchema.safeParse(insufficientBalResult);
      if (!payByInsufficientOutput.success) {
        console.error(
          "[modules/balances] payByWallet output validation failed:",
          payByInsufficientOutput.error.issues,
        );
      }

      return insufficientBalResult;
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
        senderBalance - amount,
        JSON.stringify({ type: "payByWallet", data: `Paid to ${recipient.username}`, recipientUuid: recipient.user_uuid }),
      ],
    );

    await walletQuery(
      `UPDATE balance_account SET balance = ? WHERE balance_account_uuid = ?`,
      [senderBalance - amount, senderAccount.balance_account_uuid],
    );

    // 10. Get recipient's current balance before crediting
    const recipientAccountRows = await walletQuery<Array<{ balance_account_uuid: string; balance: number }>>(
      `SELECT balance_account_uuid, balance
       FROM balance_account
       WHERE account_uuid = ? AND type = ?
       LIMIT 1`,
      [recipient.user_uuid, TYPE_USER_PAYABLE],
    );

    const recipientAccount = recipientAccountRows[0];
    const recipientBalance = Number(recipientAccount.balance);

    // 11. Credit recipient
    await walletQuery(
      `INSERT INTO balance_transaction (account_uuid, amount, balance, data, created_at, transaction_datetime)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [
        recipientAccount.balance_account_uuid,
        amount,
        recipientBalance + amount,
        JSON.stringify({ type: "payByWallet", data: `Received from anonymous`, senderUuid: walletUuid }),
      ],
    );

    await walletQuery(
      `UPDATE balance_account SET balance = ? WHERE balance_account_uuid = ?`,
      [recipientBalance + amount, recipientAccount.balance_account_uuid],
    );

    const successResult2: PayByWalletState = { success: true };

    // Validate output shape
    const payBySuccessOutput = payByWalletStateSchema.safeParse(successResult2);
    if (!payBySuccessOutput.success) {
      console.error(
        "[modules/balances] payByWallet output validation failed:",
        payBySuccessOutput.error.issues,
      );
    }

    return successResult2;
  } catch (error) {
    console.error("payByWallet failed:", error);
    const catchResult2: PayByWalletState = {
      success: false,
      error: error instanceof Error ? error.message : "Payment failed due to an unknown error.",
    };

    // Validate output shape
    const payByCatchOutput = payByWalletStateSchema.safeParse(catchResult2);
    if (!payByCatchOutput.success) {
      console.error(
        "[modules/balances] payByWallet output validation failed:",
        payByCatchOutput.error.issues,
      );
    }

    return catchResult2;
  }
}
