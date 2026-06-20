import { describe, it, expect } from "vitest";
import {
  payableAccountSchema,
  balanceTransactionSchema,
  listBalancesResultSchema,
  getBalanceResultSchema,
  initTransferStateSchema,
  payByWalletStateSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// payableAccountSchema
// ---------------------------------------------------------------------------
describe("payableAccountSchema", () => {
  const valid = {
    balance_account_uuid: "ba_001",
    account_uuid: "acct_123",
    balance: 1500.5,
    type: "wallet",
  };

  it("accepts a valid payable account", () => {
    expect(payableAccountSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts zero balance", () => {
    expect(
      payableAccountSchema.safeParse({ ...valid, balance: 0 }).success,
    ).toBe(true);
  });

  it("accepts negative balance", () => {
    expect(
      payableAccountSchema.safeParse({ ...valid, balance: -100 }).success,
    ).toBe(true);
  });

  it("rejects missing balance_account_uuid", () => {
    const { balance_account_uuid: _, ...rest } = valid;
    expect(payableAccountSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing account_uuid", () => {
    const { account_uuid: _, ...rest } = valid;
    expect(payableAccountSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing type", () => {
    const { type: _, ...rest } = valid;
    expect(payableAccountSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// balanceTransactionSchema
// ---------------------------------------------------------------------------
describe("balanceTransactionSchema", () => {
  const now = new Date();
  const valid = {
    balance_transaction_uuid: "bt_001",
    account_uuid: "acct_123",
    amount: 500,
    balance: 2000,
    data: "payment ref 123",
    created_at: now,
    transaction_datetime: now,
    currency_code: "KWD",
  };

  it("accepts a valid transaction", () => {
    expect(balanceTransactionSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable data", () => {
    expect(
      balanceTransactionSchema.safeParse({ ...valid, data: null }).success,
    ).toBe(true);
  });

  it("accepts nullable created_at", () => {
    expect(
      balanceTransactionSchema.safeParse({ ...valid, created_at: null }).success,
    ).toBe(true);
  });

  it("accepts nullable transaction_datetime", () => {
    expect(
      balanceTransactionSchema.safeParse({ ...valid, transaction_datetime: null })
        .success,
    ).toBe(true);
  });

  it("accepts nullable currency_code", () => {
    expect(
      balanceTransactionSchema.safeParse({ ...valid, currency_code: null })
        .success,
    ).toBe(true);
  });

  it("accepts all nullable fields simultaneously", () => {
    expect(
      balanceTransactionSchema.safeParse({
        balance_transaction_uuid: "bt_002",
        account_uuid: "acct_456",
        amount: -50,
        balance: 100,
        data: null,
        created_at: null,
        transaction_datetime: null,
        currency_code: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing balance_transaction_uuid", () => {
    const { balance_transaction_uuid: _, ...rest } = valid;
    expect(balanceTransactionSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing account_uuid", () => {
    const { account_uuid: _, ...rest } = valid;
    expect(balanceTransactionSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing amount", () => {
    const { amount: _, ...rest } = valid;
    expect(balanceTransactionSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing balance", () => {
    const { balance: _, ...rest } = valid;
    expect(balanceTransactionSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for amount", () => {
    expect(
      balanceTransactionSchema.safeParse({ ...valid, amount: "not-number" })
        .success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listBalancesResultSchema
// ---------------------------------------------------------------------------
describe("listBalancesResultSchema", () => {
  const valid = {
    account: {
      balance_account_uuid: "ba_001",
      account_uuid: "acct_123",
      balance: 5000,
      type: "wallet",
    },
    transactions: [
      {
        balance_transaction_uuid: "bt_001",
        account_uuid: "acct_123",
        amount: 100,
        balance: 5000,
        data: null,
        created_at: null,
        transaction_datetime: null,
        currency_code: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid result", () => {
    expect(listBalancesResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts null account", () => {
    expect(
      listBalancesResultSchema.safeParse({ ...valid, account: null }).success,
    ).toBe(true);
  });

  it("accepts empty transactions", () => {
    expect(
      listBalancesResultSchema.safeParse({
        ...valid,
        transactions: [],
        total: 0,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing account", () => {
    const { account: _, ...rest } = valid;
    expect(listBalancesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing transactions", () => {
    const { transactions: _, ...rest } = valid;
    expect(listBalancesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-array transactions", () => {
    expect(
      listBalancesResultSchema.safeParse({ ...valid, transactions: "bad" })
        .success,
    ).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      listBalancesResultSchema.safeParse({ ...valid, total: -1 }).success,
    ).toBe(false);
  });

  it("rejects zero page", () => {
    expect(
      listBalancesResultSchema.safeParse({ ...valid, page: 0 }).success,
    ).toBe(false);
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = valid;
    expect(listBalancesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for page", () => {
    expect(
      listBalancesResultSchema.safeParse({ ...valid, page: "first" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getBalanceResultSchema (nullable)
// ---------------------------------------------------------------------------
describe("getBalanceResultSchema", () => {
  const valid = {
    balance: 2500,
    accountUuid: "acct_123",
    type: "wallet",
  };

  it("accepts null", () => {
    expect(getBalanceResultSchema.safeParse(null).success).toBe(true);
  });

  it("accepts a valid balance result", () => {
    expect(getBalanceResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts zero balance", () => {
    expect(
      getBalanceResultSchema.safeParse({ ...valid, balance: 0 }).success,
    ).toBe(true);
  });

  it("rejects missing balance", () => {
    const { balance: _, ...rest } = valid;
    expect(getBalanceResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing accountUuid", () => {
    const { accountUuid: _, ...rest } = valid;
    expect(getBalanceResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing type", () => {
    const { type: _, ...rest } = valid;
    expect(getBalanceResultSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// initTransferStateSchema
// ---------------------------------------------------------------------------
describe("initTransferStateSchema", () => {
  it("accepts success result", () => {
    expect(
      initTransferStateSchema.safeParse({ success: true }).success,
    ).toBe(true);
  });

  it("accepts error result", () => {
    expect(
      initTransferStateSchema.safeParse({
        success: false,
        error: "Insufficient funds.",
      }).success,
    ).toBe(true);
  });

  it("accepts error without error message", () => {
    expect(
      initTransferStateSchema.safeParse({ success: false }).success,
    ).toBe(true);
  });

  it("rejects missing success", () => {
    expect(initTransferStateSchema.safeParse({}).success).toBe(false);
  });

  it("rejects wrong type for success", () => {
    expect(
      initTransferStateSchema.safeParse({ success: "yes" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// payByWalletStateSchema
// ---------------------------------------------------------------------------
describe("payByWalletStateSchema", () => {
  it("accepts success result", () => {
    expect(
      payByWalletStateSchema.safeParse({ success: true }).success,
    ).toBe(true);
  });

  it("accepts error result", () => {
    expect(
      payByWalletStateSchema.safeParse({
        success: false,
        error: "Payment failed.",
      }).success,
    ).toBe(true);
  });

  it("accepts error without error message", () => {
    expect(
      payByWalletStateSchema.safeParse({ success: false }).success,
    ).toBe(true);
  });

  it("rejects missing success", () => {
    expect(payByWalletStateSchema.safeParse({}).success).toBe(false);
  });

  it("rejects wrong type for success", () => {
    expect(
      payByWalletStateSchema.safeParse({ success: 1 }).success,
    ).toBe(false);
  });
});
