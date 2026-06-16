import { describe, it, expect } from "vitest";
import {
  getTransferSchema,
  updateTransferStatusSchema,
  transferExistenceSchema,
  transferStatusUpdateResultSchema,
} from "./schemas";

/**
 * Page migration test for admin/transfers/[id].
 *
 * Verifies the data contract between page and action.
 * The admin transfer detail page uses getTransfer and updateTransferStatus actions.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("admin transfer detail page — data contract", () => {
  // -----------------------------------------------------------------------
  // getTransferSchema
  // -----------------------------------------------------------------------
  it("getTransferSchema accepts valid transferId", () => {
    const r = getTransferSchema.safeParse({ transferId: 42 });
    expect(r.success).toBe(true);
  });

  it("getTransferSchema coerces string number", () => {
    const r = getTransferSchema.safeParse({ transferId: "42" });
    expect(r.success).toBe(true);
    if (r.success) expect(typeof r.data.transferId).toBe("number");
  });

  it("getTransferSchema rejects missing transferId", () => {
    const r = getTransferSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("getTransferSchema rejects zero transferId", () => {
    const r = getTransferSchema.safeParse({ transferId: 0 });
    expect(r.success).toBe(false);
  });

  it("getTransferSchema rejects negative transferId", () => {
    const r = getTransferSchema.safeParse({ transferId: -1 });
    expect(r.success).toBe(false);
  });

  // -----------------------------------------------------------------------
  // updateTransferStatusSchema
  // -----------------------------------------------------------------------
  it("updateTransferStatusSchema accepts approve action", () => {
    const r = updateTransferStatusSchema.safeParse({
      transferId: 1,
      action: "approve",
    });
    expect(r.success).toBe(true);
  });

  it("updateTransferStatusSchema accepts reject action with reason", () => {
    const r = updateTransferStatusSchema.safeParse({
      transferId: 1,
      action: "reject",
      reason: "Incomplete documentation",
    });
    expect(r.success).toBe(true);
  });

  it("updateTransferStatusSchema defaults reason to empty string", () => {
    const r = updateTransferStatusSchema.safeParse({
      transferId: 1,
      action: "approve",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.reason).toBe("");
  });

  it("updateTransferStatusSchema rejects invalid action", () => {
    const r = updateTransferStatusSchema.safeParse({
      transferId: 1,
      action: "delete",
    });
    expect(r.success).toBe(false);
  });

  it("updateTransferStatusSchema rejects missing action", () => {
    const r = updateTransferStatusSchema.safeParse({ transferId: 1 });
    expect(r.success).toBe(false);
  });

  it("updateTransferStatusSchema rejects reason exceeding 500 chars", () => {
    const r = updateTransferStatusSchema.safeParse({
      transferId: 1,
      action: "reject",
      reason: "x".repeat(501),
    });
    expect(r.success).toBe(false);
  });

  // -----------------------------------------------------------------------
  // transferExistenceSchema (output)
  // -----------------------------------------------------------------------
  it("transferExistenceSchema accepts valid transfer object", () => {
    const r = transferExistenceSchema.safeParse({
      transfer_id: 1,
      transfer_status: "pending",
    });
    expect(r.success).toBe(true);
  });

  it("transferExistenceSchema accepts null (transfer not found)", () => {
    const r = transferExistenceSchema.safeParse(null);
    expect(r.success).toBe(true);
  });

  it("transferExistenceSchema rejects missing transfer_id", () => {
    const r = transferExistenceSchema.safeParse({ transfer_status: "approved" });
    expect(r.success).toBe(false);
  });

  it("transferExistenceSchema rejects empty transfer_status", () => {
    const r = transferExistenceSchema.safeParse({
      transfer_id: 1,
      transfer_status: "",
    });
    expect(r.success).toBe(false);
  });

  // -----------------------------------------------------------------------
  // transferStatusUpdateResultSchema (output)
  // -----------------------------------------------------------------------
  it("transferStatusUpdateResultSchema accepts success", () => {
    const r = transferStatusUpdateResultSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("transferStatusUpdateResultSchema accepts error with message", () => {
    const r = transferStatusUpdateResultSchema.safeParse({
      success: false,
      error: "Transfer already processed",
    });
    expect(r.success).toBe(true);
  });

  it("transferStatusUpdateResultSchema rejects missing success", () => {
    const r = transferStatusUpdateResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("transferStatusUpdateResultSchema rejects non-boolean success", () => {
    const r = transferStatusUpdateResultSchema.safeParse({
      success: "yes",
    });
    expect(r.success).toBe(false);
  });
});
