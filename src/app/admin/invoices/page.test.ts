import { describe, it, expect } from "vitest";
import {
  listInvoicesSchema,
  getInvoiceSchema,
  createInvoiceSchema,
  updateInvoiceSchema,
  deleteInvoiceSchema,
} from "./schemas";

/**
 * Page migration test for admin/invoices.
 *
 * Verifies the data contract between page and action.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("admin invoices page — data contract", () => {
  it("listInvoicesSchema parses with defaults", () => {
    const r = listInvoicesSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("listInvoicesSchema accepts filters", () => {
    const r = listInvoicesSchema.safeParse({
      status: "unpaid",
      companyId: 5,
      dateFrom: "2026-01-01",
    });
    expect(r.success).toBe(true);
  });

  it("getInvoiceSchema validates a positive ID", () => {
    const r = getInvoiceSchema.safeParse({ invoiceId: 123 });
    expect(r.success).toBe(true);
  });

  it("getInvoiceSchema rejects non-positive ID", () => {
    const r = getInvoiceSchema.safeParse({ invoiceId: -1 });
    expect(r.success).toBe(false);
  });

  it("createInvoiceSchema validates with optional fields", () => {
    const r = createInvoiceSchema.safeParse({
      transfer_id: 42,
      invoice_date: "2026-06-14",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.invoice_status).toBe("unpaid");
  });

  it("createInvoiceSchema validates with bare minimum", () => {
    const r = createInvoiceSchema.safeParse({});
    expect(r.success).toBe(true);
  });

  it("updateInvoiceSchema validates with invoiceId", () => {
    const r = updateInvoiceSchema.safeParse({
      invoiceId: 123,
      invoice_status: "paid",
    });
    expect(r.success).toBe(true);
  });

  it("deleteInvoiceSchema validates a positive ID", () => {
    const r = deleteInvoiceSchema.safeParse({ invoiceId: 42 });
    expect(r.success).toBe(true);
  });

  it("deleteInvoiceSchema rejects invalid ID", () => {
    const r = deleteInvoiceSchema.safeParse({ invoiceId: 0 });
    expect(r.success).toBe(false);
  });
});
