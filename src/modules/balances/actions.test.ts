import { describe, it, expect } from "vitest";
import { z } from "zod";
import { payByWalletSchema } from "./actions";
import type { PayByWalletState } from "./actions";

// ---------------------------------------------------------------------------
// Pure logic: balance schema validation
//
// The balance actions use these schemas internally. Testing them
// separately avoids mocking "use server" dependencies (wallet-db, session, etc.).
// ---------------------------------------------------------------------------

const listBalancesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getBalanceSchema = z.object({
  accountUuid: z.string().min(1, "Account UUID is required"),
});

describe("listBalancesSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const result = listBalancesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts explicit pagination values", () => {
    const result = listBalancesSchema.safeParse({ page: "3", limit: "50" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(50);
    }
  });

  it("rejects zero page", () => {
    const result = listBalancesSchema.safeParse({ page: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listBalancesSchema.safeParse({ page: "-1" });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = listBalancesSchema.safeParse({ limit: "200" });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric page", () => {
    const result = listBalancesSchema.safeParse({ page: "abc" });
    expect(result.success).toBe(false);
  });
});

describe("getBalanceSchema", () => {
  it("accepts valid account UUID", () => {
    const result = getBalanceSchema.safeParse({
      accountUuid: "123e4567-e89b-12d3-a456-426614174000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty account UUID", () => {
    const result = getBalanceSchema.safeParse({ accountUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing account UUID", () => {
    const result = getBalanceSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// initTransfer schema
// ---------------------------------------------------------------------------

const initTransferSchema = z.object({
  amount: z.coerce
    .number()
    .positive("Amount must be positive")
    .finite("Amount must be a finite number"),
});

const initTransferFormDataSchema = z.object({
  amount: z.coerce
    .number()
    .positive("Amount must be positive")
    .finite("Amount must be a finite number"),
});

describe("initTransfer — amount validation", () => {
  it("accepts a valid positive amount", () => {
    const result = initTransferSchema.safeParse({ amount: 150.5 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amount).toBe(150.5);
    }
  });

  it("accepts an integer amount from form data (string input)", () => {
    const result = initTransferFormDataSchema.safeParse({ amount: "500" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amount).toBe(500);
    }
  });

  it("rejects zero amount", () => {
    const result = initTransferSchema.safeParse({ amount: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative amount", () => {
    const result = initTransferSchema.safeParse({ amount: -10 });
    expect(result.success).toBe(false);
  });

  it("rejects NaN", () => {
    const result = initTransferSchema.safeParse({ amount: NaN });
    expect(result.success).toBe(false);
  });

  it("rejects Infinity", () => {
    const result = initTransferSchema.safeParse({ amount: Infinity });
    expect(result.success).toBe(false);
  });

  it("rejects empty amount", () => {
    const result = initTransferSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric string", () => {
    const result = initTransferFormDataSchema.safeParse({ amount: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects empty string", () => {
    const result = initTransferFormDataSchema.safeParse({ amount: "" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Schema tests — payByWallet
// ---------------------------------------------------------------------------

describe("payByWalletSchema", () => {
  it("accepts a valid positive amount", () => {
    const r = payByWalletSchema.safeParse({ amount: 10.5 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.amount).toBe(10.5);
    }
  });

  it("accepts a whole number amount", () => {
    const r = payByWalletSchema.safeParse({ amount: 100 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.amount).toBe(100);
    }
  });

  it("rejects zero amount", () => {
    const r = payByWalletSchema.safeParse({ amount: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects negative amount", () => {
    const r = payByWalletSchema.safeParse({ amount: -50 });
    expect(r.success).toBe(false);
  });

  it("rejects NaN amount", () => {
    const r = payByWalletSchema.safeParse({ amount: NaN });
    expect(r.success).toBe(false);
  });

  it("rejects Infinity amount", () => {
    const r = payByWalletSchema.safeParse({ amount: Infinity });
    expect(r.success).toBe(false);
  });

  it("rejects non-numeric amount", () => {
    const r = payByWalletSchema.safeParse({ amount: "abc" });
    expect(r.success).toBe(false);
  });

  it("coerces string number to number", () => {
    const r = payByWalletSchema.safeParse({ amount: "25.50" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.amount).toBe(25.5);
    }
  });
});

// ---------------------------------------------------------------------------
// Type shape tests — PayByWalletState
// ---------------------------------------------------------------------------

describe("PayByWalletState type", () => {
  it("has success state shape", () => {
    const state: PayByWalletState = { success: true };
    expect(state.success).toBe(true);
    expect(state.error).toBeUndefined();
  });

  it("has error state shape", () => {
    const state: PayByWalletState = {
      success: false,
      error: "Insufficient balance.",
    };
    expect(state.success).toBe(false);
    expect(state.error).toBe("Insufficient balance.");
  });

  it("allows error without success", () => {
    const state: PayByWalletState = {
      success: false,
      error: "Something went wrong.",
    };
    expect(state.success).toBe(false);
    expect(state.error).toBeDefined();
  });
});
