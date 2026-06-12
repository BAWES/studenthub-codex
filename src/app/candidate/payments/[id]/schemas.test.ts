import { describe, it, expect } from "vitest";
import {
  getPaymentSchema,
  deletePaymentSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema tests — candidate/payments/[id]
// ---------------------------------------------------------------------------

describe("getPaymentSchema", () => {
  it("accepts valid positive integer tcId", () => {
    const r = getPaymentSchema.safeParse({ tcId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.tcId).toBe(42);
    }
  });

  it("coerces string tcId to number", () => {
    const r = getPaymentSchema.safeParse({ tcId: "42" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.tcId).toBe(42);
    }
  });

  it("rejects missing tcId", () => {
    expect(getPaymentSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero tcId", () => {
    expect(getPaymentSchema.safeParse({ tcId: 0 }).success).toBe(false);
  });

  it("rejects negative tcId", () => {
    expect(getPaymentSchema.safeParse({ tcId: -5 }).success).toBe(false);
  });

  it("rejects non-numeric tcId", () => {
    expect(getPaymentSchema.safeParse({ tcId: "abc" }).success).toBe(false);
  });
});

describe("deletePaymentSchema", () => {
  it("accepts valid positive integer tcId", () => {
    const r = deletePaymentSchema.safeParse({ tcId: 99 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.tcId).toBe(99);
    }
  });

  it("coerces string tcId to number", () => {
    const r = deletePaymentSchema.safeParse({ tcId: "99" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.tcId).toBe(99);
    }
  });

  it("rejects missing tcId", () => {
    expect(deletePaymentSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero tcId", () => {
    expect(deletePaymentSchema.safeParse({ tcId: 0 }).success).toBe(false);
  });

  it("rejects negative tcId", () => {
    expect(deletePaymentSchema.safeParse({ tcId: -1 }).success).toBe(false);
  });

  it("rejects non-numeric tcId", () => {
    expect(deletePaymentSchema.safeParse({ tcId: "xyz" }).success).toBe(false);
  });
});
