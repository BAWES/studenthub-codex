import { describe, it, expect } from "vitest";
import {
  listPaymentsSchema,
  getPaymentSchema,
  paymentRowOutputSchema,
  listPaymentsOutputSchema,
  lineItemOutputSchema,
  paymentContactOutputSchema,
  paymentNestedOutputSchema,
  paymentDetailOutputSchema,
  metricOutputSchema,
} from "./schemas";

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
    const r = listPaymentsSchema.safeParse({ status: "paid", type: "invoice" });
    expect(r.success).toBe(true);
  });

  it("getPaymentSchema validates with paymentId", () => {
    const r = getPaymentSchema.safeParse({ paymentId: "pmt-001" });
    expect(r.success).toBe(true);
  });

  it("getPaymentSchema rejects missing paymentId", () => {
    const r = getPaymentSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("paymentRowOutputSchema validates a row entry", () => {
    const r = paymentRowOutputSchema.safeParse({
      bank_transaction_id: "btx-001",
      reference: "INV-2026-001",
      status: "paid",
      type: "invoice",
      total: 1500.0,
      currency_code: "KWD",
      contact_name: "Acme Corp",
      date: "2026-06-14",
      is_reconciled: true,
      line_items_count: 3,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.bank_transaction_id).toBe("btx-001");
    }
  });

  it("paymentRowOutputSchema accepts nullable fields", () => {
    const r = paymentRowOutputSchema.safeParse({
      bank_transaction_id: "btx-002",
      reference: null,
      status: null,
      type: null,
      total: null,
      currency_code: null,
      contact_name: null,
      date: "2026-06-14",
      is_reconciled: null,
      line_items_count: 0,
    });
    expect(r.success).toBe(true);
  });

  it("paymentRowOutputSchema rejects missing bank_transaction_id", () => {
    const r = paymentRowOutputSchema.safeParse({ date: "2026-06-14", line_items_count: 0 });
    expect(r.success).toBe(false);
  });

  it("listPaymentsOutputSchema validates paginated result", () => {
    const r = listPaymentsOutputSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("listPaymentsOutputSchema validates with items", () => {
    const r = listPaymentsOutputSchema.safeParse({
      items: [
        {
          bank_transaction_id: "btx-001",
          reference: "REF-001",
          status: "paid",
          type: "invoice",
          total: 500.0,
          currency_code: "KWD",
          contact_name: "Acme",
          date: "2026-06-01",
          is_reconciled: false,
          line_items_count: 1,
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

  it("metricOutputSchema validates metric entry", () => {
    const r = metricOutputSchema.safeParse({
      label: "Total Payments",
      value: "2500 KWD",
      note: "Current period",
    });
    expect(r.success).toBe(true);
  });

  it("metricOutputSchema accepts numeric value", () => {
    const r = metricOutputSchema.safeParse({
      label: "Count",
      value: 42,
      note: "Total transactions",
    });
    expect(r.success).toBe(true);
  });

  it("lineItemOutputSchema validates a line item", () => {
    const r = lineItemOutputSchema.safeParse({
      line_item_id: "li-001",
      account_code: "ACC-200",
      description: "Consulting services",
      line_amount: 1000.0,
      quantity: 1,
      unit_amount: 1000.0,
    });
    expect(r.success).toBe(true);
  });

  it("lineItemOutputSchema accepts nullable fields", () => {
    const r = lineItemOutputSchema.safeParse({
      line_item_id: "li-002",
      account_code: null,
      description: null,
      line_amount: null,
      quantity: null,
      unit_amount: null,
    });
    expect(r.success).toBe(true);
  });

  it("paymentContactOutputSchema validates contact", () => {
    const r = paymentContactOutputSchema.safeParse({
      contact_id: "cnt-001",
      name: "John Doe",
    });
    expect(r.success).toBe(true);
  });

  it("paymentContactOutputSchema accepts null name", () => {
    const r = paymentContactOutputSchema.safeParse({
      contact_id: "cnt-002",
      name: null,
    });
    expect(r.success).toBe(true);
  });

  it("paymentNestedOutputSchema validates full payment object", () => {
    const r = paymentNestedOutputSchema.safeParse({
      bank_transaction_id: "btx-001",
      reference: "REF-001",
      status: "paid",
      type: "invoice",
      total: 1500.0,
      sub_total: 1200.0,
      total_tax: 300.0,
      currency_rate: 1.0,
      currency_code: "KWD",
      line_amount_types: "Inclusive",
      has_attachments: false,
      is_reconciled: true,
      date: "2026-06-14",
      created_at: "2026-06-10",
      updated_at: "2026-06-14",
      contact: { contact_id: "cnt-001", name: "John Doe" },
    });
    expect(r.success).toBe(true);
  });

  it("paymentNestedOutputSchema accepts null contact", () => {
    const r = paymentNestedOutputSchema.safeParse({
      bank_transaction_id: "btx-002",
      reference: null,
      status: null,
      type: null,
      total: null,
      sub_total: null,
      total_tax: null,
      currency_rate: null,
      currency_code: null,
      line_amount_types: null,
      has_attachments: null,
      is_reconciled: null,
      date: null,
      created_at: null,
      updated_at: null,
      contact: null,
    });
    expect(r.success).toBe(true);
  });

  it("paymentDetailOutputSchema validates null payment", () => {
    const r = paymentDetailOutputSchema.safeParse({
      payment: null,
      line_items: [],
      metrics: [],
    });
    expect(r.success).toBe(true);
  });

  it("paymentDetailOutputSchema validates with full data", () => {
    const r = paymentDetailOutputSchema.safeParse({
      payment: {
        bank_transaction_id: "btx-001",
        reference: "REF-001",
        status: "paid",
        type: "invoice",
        total: 1500.0,
        sub_total: 1200.0,
        total_tax: 300.0,
        currency_rate: 1.0,
        currency_code: "KWD",
        line_amount_types: "Inclusive",
        has_attachments: false,
        is_reconciled: true,
        date: "2026-06-14",
        created_at: "2026-06-10",
        updated_at: "2026-06-14",
        contact: { contact_id: "cnt-001", name: "John Doe" },
      },
      line_items: [
        { line_item_id: "li-001", account_code: "ACC-200", description: "Services", line_amount: 1000.0, quantity: 1, unit_amount: 1000.0 },
      ],
      metrics: [
        { label: "Total", value: "1500 KWD", note: "Payment total" },
      ],
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.line_items.length).toBe(1);
      expect(r.data.metrics.length).toBe(1);
    }
  });
});
