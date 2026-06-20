import { describe, it, expect } from "vitest";
import {
  listTransfersSchema,
  getTransferSchema,
  approveTransferSchema,
  rejectTransferSchema,
  listTransfersResultSchema,
  transferActionResponseSchema,
  transferDetailResultSchema,
} from "./schemas";

/**
 * Page migration test for admin/transfers.
 *
 * Verifies the data contract between page and action.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("admin transfers page — data contract", () => {
  it("listTransfersSchema parses with defaults", () => {
    const r = listTransfersSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("listTransfersSchema accepts filters", () => {
    const r = listTransfersSchema.safeParse({
      companyId: 5,
      status: 1,
    });
    expect(r.success).toBe(true);
  });

  it("getTransferSchema validates with transferId number", () => {
    const r = getTransferSchema.safeParse({ transferId: 42 });
    expect(r.success).toBe(true);
  });

  it("getTransferSchema rejects non-positive transferId", () => {
    const r = getTransferSchema.safeParse({ transferId: 0 });
    expect(r.success).toBe(false);
  });

  it("approveTransferSchema validates with transferId", () => {
    const r = approveTransferSchema.safeParse({ transferId: 42 });
    expect(r.success).toBe(true);
  });

  it("rejectTransferSchema validates with transferId and reason", () => {
    const r = rejectTransferSchema.safeParse({
      transferId: 42,
      reason: "Insufficient documentation",
    });
    expect(r.success).toBe(true);
  });

  it("rejectTransferSchema rejects missing reason", () => {
    const r = rejectTransferSchema.safeParse({ transferId: 42 });
    expect(r.success).toBe(false);
  });

  it("listTransfersResultSchema validates paginated result", () => {
    const r = listTransfersResultSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("transferActionResponseSchema validates success", () => {
    const r = transferActionResponseSchema.safeParse({
      success: true,
    });
    expect(r.success).toBe(true);
  });

  it("transferActionResponseSchema validates error", () => {
    const r = transferActionResponseSchema.safeParse({
      success: false,
      error: "Transfer not found",
    });
    expect(r.success).toBe(true);
  });

  it("transferDetailResultSchema validates full transfer detail", () => {
    const r = transferDetailResultSchema.safeParse({
      transfer: null,
      candidates: [],
      invoices: [],
      metrics: [],
    });
    expect(r.success).toBe(true);
  });
});
