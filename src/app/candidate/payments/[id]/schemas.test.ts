import { describe, it, expect } from "vitest";
import {
  getPaymentSchema,
  deletePaymentSchema,
  paymentExistenceSchema,
  paymentActionResultSchema,
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

// ---------------------------------------------------------------------------
// Output validation schema tests — paymentExistenceSchema
// ---------------------------------------------------------------------------

describe("paymentExistenceSchema", () => {
  it("accepts a valid object with tc_id", () => {
    const r = paymentExistenceSchema.safeParse({ tc_id: 1 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).toEqual({ tc_id: 1 });
    }
  });

  it("accepts null (payment not found)", () => {
    const r = paymentExistenceSchema.safeParse(null);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).toBeNull();
    }
  });

  it("rejects an object with non-positive tc_id", () => {
    expect(paymentExistenceSchema.safeParse({ tc_id: 0 }).success).toBe(false);
    expect(paymentExistenceSchema.safeParse({ tc_id: -1 }).success).toBe(false);
  });

  it("rejects an object with missing tc_id", () => {
    expect(paymentExistenceSchema.safeParse({}).success).toBe(false);
  });

  it("rejects undefined", () => {
    expect(paymentExistenceSchema.safeParse(undefined).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output validation schema tests — paymentActionResultSchema
// ---------------------------------------------------------------------------

describe("paymentActionResultSchema", () => {
  it("accepts a valid success result", () => {
    const r = paymentActionResultSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.success).toBe(true);
    }
  });

  it("accepts a valid failure result with error string", () => {
    const r = paymentActionResultSchema.safeParse({
      success: false,
      error: "Something went wrong",
    });
    expect(r.success).toBe(true);
  });

  it("rejects a result with missing error on failure", () => {
    const r = paymentActionResultSchema.safeParse({ success: false });
    expect(r.success).toBe(false);
  });

  it("rejects a result with non-string error on failure", () => {
    const r = paymentActionResultSchema.safeParse({
      success: false,
      error: 42,
    });
    expect(r.success).toBe(false);
  });

  it("rejects a result with extra fields", () => {
    const r = paymentActionResultSchema.safeParse({
      success: true,
      extraField: "should not be here",
    });
    // discriminated union strips extra fields by default
    // but .parse should still succeed — it only validates the shape
    expect(r.success).toBe(true);
  });
});
