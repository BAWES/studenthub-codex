import { describe, it, expect } from "vitest";
import {
  listPaymentsSchema,
  getPaymentSchema,
} from "./schemas";

/**
 * Page migration test for admin/payments.
 *
 * Verifies the data contract between page and action.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("admin payments page — data contract", () => {
  it("listPaymentsSchema parses with defaults", () => {
    const r = listPaymentsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("listPaymentsSchema accepts filters", () => {
    const r = listPaymentsSchema.safeParse({
      status: "completed",
      type: "bank",
      dateFrom: "2026-01-01",
      dateTo: "2026-06-14",
    });
    expect(r.success).toBe(true);
  });

  it("getPaymentSchema validates a non-empty string", () => {
    const r = getPaymentSchema.safeParse({ paymentId: "PAY-001" });
    expect(r.success).toBe(true);
  });

  it("getPaymentSchema rejects empty paymentId", () => {
    const r = getPaymentSchema.safeParse({ paymentId: "" });
    expect(r.success).toBe(false);
  });

  it("listPaymentsSchema rejects invalid page", () => {
    const r = listPaymentsSchema.safeParse({ page: 0 });
    expect(r.success).toBe(false);
  });
});
