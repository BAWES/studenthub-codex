import { describe, it, expect } from "vitest";
import {
  listInvoicesSchema,
  getInvoiceSchema,
  createInvoiceSchema,
  updateInvoiceSchema,
  deleteInvoiceSchema,
  invoiceRowOutputSchema,
  listInvoicesOutputSchema,
  invoiceNestedOutputSchema,
  invoiceDetailOutputSchema,
  invoiceMutationOutputSchema,
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
    const r = listInvoicesSchema.safeParse({ status: "paid", companyId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.status).toBe("paid");
      expect(r.data.companyId).toBe(42);
    }
  });

  it("getInvoiceSchema validates with invoiceId", () => {
    const r = getInvoiceSchema.safeParse({ invoiceId: 1 });
    expect(r.success).toBe(true);
  });

  it("getInvoiceSchema rejects missing invoiceId", () => {
    const r = getInvoiceSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("createInvoiceSchema validates with optional fields", () => {
    const r = createInvoiceSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.invoice_status).toBe("unpaid");
    }
  });

  it("createInvoiceSchema accepts transfer_id", () => {
    const r = createInvoiceSchema.safeParse({ transfer_id: 5 });
    expect(r.success).toBe(true);
  });

  it("updateInvoiceSchema validates with invoiceId", () => {
    const r = updateInvoiceSchema.safeParse({ invoiceId: 1 });
    expect(r.success).toBe(true);
  });

  it("updateInvoiceSchema accepts partial update", () => {
    const r = updateInvoiceSchema.safeParse({ invoiceId: 1, invoice_status: "paid" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.invoice_status).toBe("paid");
    }
  });

  it("updateInvoiceSchema rejects missing invoiceId", () => {
    const r = updateInvoiceSchema.safeParse({ invoice_status: "paid" });
    expect(r.success).toBe(false);
  });

  it("deleteInvoiceSchema validates with invoiceId", () => {
    const r = deleteInvoiceSchema.safeParse({ invoiceId: 1 });
    expect(r.success).toBe(true);
  });

  it("deleteInvoiceSchema rejects missing invoiceId", () => {
    const r = deleteInvoiceSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("invoiceRowOutputSchema validates a row entry", () => {
    const r = invoiceRowOutputSchema.safeParse({
      invoice_id: 1,
      transfer_id: 5,
      company_name: "Test Corp",
      invoice_date: "2026-06-14",
      invoice_status: "paid",
      total: "1500.00",
      currency_code: "KWD",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.invoice_id).toBe(1);
      expect(r.data.company_name).toBe("Test Corp");
    }
  });

  it("invoiceRowOutputSchema accepts nullable fields", () => {
    const r = invoiceRowOutputSchema.safeParse({
      invoice_id: 2,
      transfer_id: null,
      company_name: null,
      invoice_date: null,
      invoice_status: null,
      total: null,
      currency_code: null,
    });
    expect(r.success).toBe(true);
  });

  it("invoiceRowOutputSchema rejects missing required invoice_id", () => {
    const r = invoiceRowOutputSchema.safeParse({
      transfer_id: 5,
    });
    expect(r.success).toBe(false);
  });

  it("listInvoicesOutputSchema validates paginated result", () => {
    const r = listInvoicesOutputSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("listInvoicesOutputSchema validates with items", () => {
    const r = listInvoicesOutputSchema.safeParse({
      items: [
        {
          invoice_id: 1,
          transfer_id: null,
          company_name: "Acme",
          invoice_date: "2026-06-01",
          invoice_status: "unpaid",
          total: "500.00",
          currency_code: "KWD",
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.items.length).toBe(1);
    }
  });

  it("invoiceNestedOutputSchema validates detail invoice", () => {
    const r = invoiceNestedOutputSchema.safeParse({
      invoice_id: 1,
      transfer_id: 5,
      invoice_date: "2026-06-14",
      invoice_status: "paid",
      total: "1500.00",
      company_total: "1800.00",
      currency_code: "KWD",
      payment_received_on: "2026-06-15",
      company: {
        company_name: "Test Corp",
        company_email: "corp@test.com",
      },
    });
    expect(r.success).toBe(true);
  });

  it("invoiceNestedOutputSchema validates with null company", () => {
    const r = invoiceNestedOutputSchema.safeParse({
      invoice_id: 1,
      transfer_id: null,
      invoice_date: null,
      invoice_status: null,
      total: null,
      company_total: null,
      currency_code: null,
      payment_received_on: null,
      company: null,
    });
    expect(r.success).toBe(true);
  });

  it("invoiceDetailOutputSchema validates full detail result", () => {
    const r = invoiceDetailOutputSchema.safeParse({
      invoice: null,
      candidate_payouts: [],
      metrics: [],
    });
    expect(r.success).toBe(true);
  });

  it("invoiceDetailOutputSchema validates with data", () => {
    const r = invoiceDetailOutputSchema.safeParse({
      invoice: {
        invoice_id: 1,
        transfer_id: 5,
        invoice_date: "2026-06-14",
        invoice_status: "paid",
        total: "1500.00",
        company_total: "1800.00",
        currency_code: "KWD",
        payment_received_on: "2026-06-15",
        company: { company_name: "Test Corp", company_email: "corp@test.com" },
      },
      candidate_payouts: [
        { tc_id: 1, candidate_name: "Ahmed", hours: 40, amount: "200.00", paid: 1 },
      ],
      metrics: [
        { label: "Total Invoiced", value: "1500.00 KWD", note: "Current period" },
      ],
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.metrics.length).toBe(1);
    }
  });

  it("invoiceMutationOutputSchema validates mutation result", () => {
    const r = invoiceMutationOutputSchema.safeParse({ invoice_id: 1 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.invoice_id).toBe(1);
    }
  });

  it("invoiceMutationOutputSchema rejects missing invoice_id", () => {
    const r = invoiceMutationOutputSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});
