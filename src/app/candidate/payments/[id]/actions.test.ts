import { describe, it, expect } from "vitest";
import {
  getPaymentSchema,
  deletePaymentSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests for candidate/payments/[id] actions (pure unit — no DB)
// ---------------------------------------------------------------------------

describe("getPaymentSchema", () => {
  it("accepts a valid integer tcId", () => {
    expect(getPaymentSchema.safeParse({ tcId: 42 }).success).toBe(true);
  });

  it("coerces a string tcId to number", () => {
    const r = getPaymentSchema.safeParse({ tcId: "42" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.tcId).toBe(42);
    }
  });

  it("rejects zero tcId", () => {
    expect(getPaymentSchema.safeParse({ tcId: 0 }).success).toBe(false);
  });

  it("rejects negative tcId", () => {
    expect(getPaymentSchema.safeParse({ tcId: -1 }).success).toBe(false);
  });

  it("rejects missing tcId", () => {
    expect(getPaymentSchema.safeParse({}).success).toBe(false);
  });
});

describe("deletePaymentSchema", () => {
  it("accepts a valid integer tcId", () => {
    expect(deletePaymentSchema.safeParse({ tcId: 42 }).success).toBe(true);
  });

  it("coerces a string tcId to number", () => {
    const r = deletePaymentSchema.safeParse({ tcId: "42" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.tcId).toBe(42);
    }
  });

  it("rejects zero tcId", () => {
    expect(deletePaymentSchema.safeParse({ tcId: 0 }).success).toBe(false);
  });

  it("rejects negative tcId", () => {
    expect(deletePaymentSchema.safeParse({ tcId: -1 }).success).toBe(false);
  });

  it("rejects missing tcId", () => {
    expect(deletePaymentSchema.safeParse({}).success).toBe(false);
  });
});
