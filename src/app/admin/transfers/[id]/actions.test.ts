import { describe, it, expect } from "vitest";
import {
  getTransferSchema,
  updateTransferStatusSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests — pure unit tests, no DB required
// ---------------------------------------------------------------------------

describe("getTransferSchema", () => {
  it("accepts a valid numeric transfer ID", () => {
    const r = getTransferSchema.safeParse({ transferId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.transferId).toBe(42);
    }
  });

  it("rejects negative transfer ID", () => {
    expect(getTransferSchema.safeParse({ transferId: -1 }).success).toBe(false);
  });

  it("rejects zero transfer ID", () => {
    expect(getTransferSchema.safeParse({ transferId: 0 }).success).toBe(false);
  });

  it("rejects non-integer transfer ID", () => {
    expect(getTransferSchema.safeParse({ transferId: 12.5 }).success).toBe(false);
  });

  it("rejects missing transfer ID", () => {
    expect(getTransferSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-numeric transfer ID", () => {
    expect(getTransferSchema.safeParse({ transferId: "abc" }).success).toBe(false);
  });
});

describe("updateTransferStatusSchema", () => {
  it("accepts valid transfer ID and request body", () => {
    const r = updateTransferStatusSchema.safeParse({
      transferId: 42,
      action: "approve",
      reason: "All candidates verified",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.transferId).toBe(42);
      expect(r.data.action).toBe("approve");
      expect(r.data.reason).toBe("All candidates verified");
    }
  });

  it("accepts reject action without reason", () => {
    const r = updateTransferStatusSchema.safeParse({
      transferId: 42,
      action: "reject",
      reason: "Budget constraints",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.action).toBe("reject");
    }
  });

  it("rejects missing transfer ID", () => {
    expect(
      updateTransferStatusSchema.safeParse({ action: "approve", reason: "OK" })
        .success,
    ).toBe(false);
  });

  it("rejects non-positive transfer ID", () => {
    expect(
      updateTransferStatusSchema.safeParse({
        transferId: -1,
        action: "approve",
        reason: "",
      }).success,
    ).toBe(false);
  });

  it("rejects empty action", () => {
    expect(
      updateTransferStatusSchema.safeParse({
        transferId: 1,
        action: "",
        reason: "",
      }).success,
    ).toBe(false);
  });

  it("rejects invalid action value", () => {
    expect(
      updateTransferStatusSchema.safeParse({
        transferId: 1,
        action: "delete",
        reason: "",
      }).success,
    ).toBe(false);
  });

  it("rejects missing action", () => {
    expect(
      updateTransferStatusSchema.safeParse({ transferId: 1, reason: "" })
        .success,
    ).toBe(false);
  });

  it("rejects reason over 500 chars", () => {
    const longReason = "x".repeat(501);
    expect(
      updateTransferStatusSchema.safeParse({
        transferId: 1,
        action: "reject",
        reason: longReason,
      }).success,
    ).toBe(false);
  });

  it("accepts reason at exactly 500 chars", () => {
    const longReason = "x".repeat(500);
    const r = updateTransferStatusSchema.safeParse({
      transferId: 1,
      action: "reject",
      reason: longReason,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.reason).toBe(longReason);
    }
  });
});
