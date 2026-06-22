import { describe, it, expect } from "vitest";
import {
  getTransferSchema,
  updateTransferStatusSchema,
  transferExistenceSchema,
  transferStatusUpdateResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// getTransferSchema
// ---------------------------------------------------------------------------
describe("getTransferSchema", () => {
  const validInput = { transferId: "42" };

  it("accepts valid input", () => {
    expect(getTransferSchema.safeParse(validInput).success).toBe(true);
  });

  it("accepts numeric transferId", () => {
    expect(getTransferSchema.safeParse({ transferId: 99 }).success).toBe(true);
  });

  it("rejects missing transferId", () => {
    expect(getTransferSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero transferId", () => {
    expect(
      getTransferSchema.safeParse({ transferId: "0" }).success,
    ).toBe(false);
  });

  it("rejects negative transferId", () => {
    expect(
      getTransferSchema.safeParse({ transferId: "-5" }).success,
    ).toBe(false);
  });

  it("rejects non-numeric transferId", () => {
    expect(
      getTransferSchema.safeParse({ transferId: "abc" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateTransferStatusSchema
// ---------------------------------------------------------------------------
describe("updateTransferStatusSchema", () => {
  const validInput = { transferId: "42", action: "approve" };

  it("accepts approve action", () => {
    expect(updateTransferStatusSchema.safeParse(validInput).success).toBe(
      true,
    );
  });

  it("accepts reject action", () => {
    expect(
      updateTransferStatusSchema.safeParse({
        transferId: "42",
        action: "reject",
      }).success,
    ).toBe(true);
  });

  it("accepts optional reason", () => {
    expect(
      updateTransferStatusSchema.safeParse({
        transferId: "42",
        action: "reject",
        reason: "Incomplete documentation",
      }).success,
    ).toBe(true);
  });

  it("defaults empty reason when omitted", () => {
    const result = updateTransferStatusSchema.safeParse({
      transferId: "42",
      action: "approve",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.reason).toBe("");
    }
  });

  it("rejects invalid action", () => {
    expect(
      updateTransferStatusSchema.safeParse({
        transferId: "42",
        action: "invalid",
      }).success,
    ).toBe(false);
  });

  it("rejects missing action", () => {
    expect(
      updateTransferStatusSchema.safeParse({ transferId: "42" }).success,
    ).toBe(false);
  });

  it("rejects missing transferId", () => {
    expect(
      updateTransferStatusSchema.safeParse({ action: "approve" }).success,
    ).toBe(false);
  });

  it("rejects reason exceeding max length", () => {
    expect(
      updateTransferStatusSchema.safeParse({
        transferId: "42",
        action: "approve",
        reason: "x".repeat(501),
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// transferExistenceSchema
// ---------------------------------------------------------------------------
describe("transferExistenceSchema", () => {
  it("accepts valid transfer object", () => {
    expect(
      transferExistenceSchema.safeParse({
        transfer_id: 1,
        transfer_status: "pending",
      }).success,
    ).toBe(true);
  });

  it("accepts null (transfer not found)", () => {
    expect(transferExistenceSchema.safeParse(null).success).toBe(true);
  });

  it("rejects missing transfer_id", () => {
    expect(
      transferExistenceSchema.safeParse({ transfer_status: "pending" }).success,
    ).toBe(false);
  });

  it("rejects missing transfer_status", () => {
    expect(
      transferExistenceSchema.safeParse({ transfer_id: 1 }).success,
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

  it("rejects non-positive transfer_id", () => {
    expect(
      transferExistenceSchema.safeParse({
        transfer_id: 0,
        transfer_status: "pending",
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// transferStatusUpdateResultSchema
// ---------------------------------------------------------------------------
describe("transferStatusUpdateResultSchema", () => {
  it("accepts success result", () => {
    expect(
      transferStatusUpdateResultSchema.safeParse({ success: true }).success,
    ).toBe(true);
  });

  it("accepts error result with message", () => {
    expect(
      transferStatusUpdateResultSchema.safeParse({
        success: false,
        error: "Transfer not found",
      }).success,
    ).toBe(true);
  });

  it("rejects success with unexpected string", () => {
    expect(
      transferStatusUpdateResultSchema.safeParse({ success: "yes" }).success,
    ).toBe(false);
  });

  it("rejects error without error message", () => {
    expect(
      transferStatusUpdateResultSchema.safeParse({ success: false }).success,
    ).toBe(false);
  });

  it("accepts extra unknown keys (stripped by Zod)", () => {
    expect(
      transferStatusUpdateResultSchema.safeParse({
        success: true,
        extra: "field",
      }).success,
    ).toBe(true);
  });
});
