import { describe, it, expect } from "vitest";
import {
  getTransferSchema,
  updateTransferStatusSchema,
  transferExistenceSchema,
  transferStatusUpdateResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema tests
// ---------------------------------------------------------------------------

describe("getTransferSchema", () => {
  it("accepts valid transfer ID", () => {
    const r = getTransferSchema.safeParse({ transferId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.transferId).toBe(42);
    }
  });

  it("coerces string ID", () => {
    const r = getTransferSchema.safeParse({ transferId: "42" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.transferId).toBe(42);
    }
  });

  it("rejects non-positive ID", () => {
    expect(getTransferSchema.safeParse({ transferId: 0 }).success).toBe(false);
    expect(getTransferSchema.safeParse({ transferId: -1 }).success).toBe(false);
  });

  it("rejects missing transferId", () => {
    expect(getTransferSchema.safeParse({}).success).toBe(false);
  });
});

describe("updateTransferStatusSchema", () => {
  const validInput = { transferId: 1, action: "approve" as const };

  it("accepts valid approve input", () => {
    const r = updateTransferStatusSchema.safeParse(validInput);
    expect(r.success).toBe(true);
  });

  it("accepts valid reject input with reason", () => {
    const r = updateTransferStatusSchema.safeParse({
      transferId: 1,
      action: "reject",
      reason: "Insufficient funds",
    });
    expect(r.success).toBe(true);
  });

  it("rejects invalid action", () => {
    expect(
      updateTransferStatusSchema.safeParse({
        transferId: 1,
        action: "invalid",
      }).success,
    ).toBe(false);
  });

  it("rejects missing transferId", () => {
    expect(
      updateTransferStatusSchema.safeParse({ action: "approve" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("transferExistenceSchema", () => {
  it("accepts valid transfer existence data", () => {
    const r = transferExistenceSchema.safeParse({
      transfer_id: 42,
      transfer_status: "pending",
    });
    expect(r.success).toBe(true);
    expect(r.data).not.toBeNull();
  });

  it("accepts null", () => {
    expect(transferExistenceSchema.safeParse(null).success).toBe(true);
  });

  it("rejects missing transfer_id", () => {
    expect(
      transferExistenceSchema.safeParse({ transfer_status: "pending" }).success,
    ).toBe(false);
  });

  it("rejects empty transfer_status", () => {
    expect(
      transferExistenceSchema.safeParse({
        transfer_id: 1,
        transfer_status: "",
      }).success,
    ).toBe(false);
  });
});

describe("transferStatusUpdateResultSchema", () => {
  it("accepts success result", () => {
    const r = transferStatusUpdateResultSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("accepts error result with message", () => {
    const r = transferStatusUpdateResultSchema.safeParse({
      success: false,
      error: "Transfer not found",
    });
    expect(r.success).toBe(true);
  });

  it("accepts success with extra error field (Zod DU is lenient by default)", () => {
    expect(
      transferStatusUpdateResultSchema.safeParse({
        success: true,
        error: "x",
      }).success,
    ).toBe(true);
  });

  it("rejects error result without error field", () => {
    expect(
      transferStatusUpdateResultSchema.safeParse({ success: false }).success,
    ).toBe(false);
  });
});
