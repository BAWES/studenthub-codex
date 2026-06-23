import { describe, it, expect } from "vitest";
import {
  getTransferSchema,
  updateTransferStatusSchema,
  transferExistenceSchema,
  transferStatusUpdateResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// getTransferSchema tests
// ---------------------------------------------------------------------------

describe("getTransferSchema", () => {
  it("accepts a valid transferId", () => {
    expect(getTransferSchema.safeParse({ transferId: 42 }).success).toBe(true);
  });

  it("coerces string number to number", () => {
    expect(getTransferSchema.safeParse({ transferId: "42" }).success).toBe(
      true,
    );
  });

  it("rejects missing transferId", () => {
    expect(getTransferSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero transferId", () => {
    expect(getTransferSchema.safeParse({ transferId: 0 }).success).toBe(false);
  });

  it("rejects negative transferId", () => {
    expect(getTransferSchema.safeParse({ transferId: -1 }).success).toBe(false);
  });

  it("rejects non-numeric transferId", () => {
    expect(
      getTransferSchema.safeParse({ transferId: "abc" }).success,
    ).toBe(false);
  });

  it("rejects null transferId", () => {
    expect(getTransferSchema.safeParse({ transferId: null }).success).toBe(
      false,
    );
  });
});

// ---------------------------------------------------------------------------
// updateTransferStatusSchema tests
// ---------------------------------------------------------------------------

describe("updateTransferStatusSchema", () => {
  const valid = { transferId: 1, action: "approve" as const };

  it("accepts approve action", () => {
    expect(updateTransferStatusSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts reject action", () => {
    expect(
      updateTransferStatusSchema.safeParse({
        ...valid,
        action: "reject",
      }).success,
    ).toBe(true);
  });

  it("accepts with optional reason", () => {
    expect(
      updateTransferStatusSchema.safeParse({
        ...valid,
        reason: "Candidate declined offer",
      }).success,
    ).toBe(true);
  });

  it("defaults reason to empty string when omitted", () => {
    const result = updateTransferStatusSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.reason).toBe("");
    }
  });

  it("rejects invalid action", () => {
    expect(
      updateTransferStatusSchema.safeParse({
        ...valid,
        action: "delete",
      }).success,
    ).toBe(false);
  });

  it("rejects missing action", () => {
    expect(
      updateTransferStatusSchema.safeParse({ transferId: 1 }).success,
    ).toBe(false);
  });

  it("rejects missing transferId", () => {
    expect(
      updateTransferStatusSchema.safeParse({ action: "approve" }).success,
    ).toBe(false);
  });

  it("rejects reason exceeding 500 chars", () => {
    expect(
      updateTransferStatusSchema.safeParse({
        ...valid,
        reason: "x".repeat(501),
      }).success,
    ).toBe(false);
  });

  it("coerces string transferId", () => {
    expect(
      updateTransferStatusSchema.safeParse({
        transferId: "1",
        action: "approve",
      }).success,
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// transferExistenceSchema tests
// ---------------------------------------------------------------------------

describe("transferExistenceSchema", () => {
  it("accepts a valid transfer object", () => {
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
      transferExistenceSchema.safeParse({ transfer_status: "approved" }).success,
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

  it("rejects non-number transfer_id", () => {
    expect(
      transferExistenceSchema.safeParse({
        transfer_id: "abc",
        transfer_status: "pending",
      }).success,
    ).toBe(false);
  });

  it("rejects undefined", () => {
    expect(transferExistenceSchema.safeParse(undefined).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// transferStatusUpdateResultSchema tests
// ---------------------------------------------------------------------------

describe("transferStatusUpdateResultSchema", () => {
  it("accepts success result", () => {
    expect(
      transferStatusUpdateResultSchema.safeParse({
        success: true,
      }).success,
    ).toBe(true);
  });

  it("accepts error result with message", () => {
    expect(
      transferStatusUpdateResultSchema.safeParse({
        success: false,
        error: "Transfer already processed",
      }).success,
    ).toBe(true);
  });

  it("rejects missing success field", () => {
    expect(transferStatusUpdateResultSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-boolean success", () => {
    expect(
      transferStatusUpdateResultSchema.safeParse({
        success: "yes",
      }).success,
    ).toBe(false);
  });
});
