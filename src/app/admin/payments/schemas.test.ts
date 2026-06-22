import { describe, it, expect } from "vitest";
import {
  listPaymentsSchema,
  getPaymentSchema,
  paymentRowOutputSchema,
  listPaymentsOutputSchema,
  lineItemOutputSchema,
  paymentContactOutputSchema,
  paymentNestedOutputSchema,
  metricOutputSchema,
  paymentDetailOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listPaymentsSchema
// ---------------------------------------------------------------------------
describe("listPaymentsSchema", () => {
  it("accepts empty input with defaults", () => {
    expect(listPaymentsSchema.safeParse({}).success).toBe(true);
  });

  it("accepts explicit values", () => {
    expect(
      listPaymentsSchema.safeParse({
        page: 2,
        limit: 50,
        status: "paid",
        type: "RECEIVE",
        dateFrom: "2024-01-01",
        dateTo: "2024-12-31",
      }).success,
    ).toBe(true);
  });

  it("rejects limit below 1", () => {
    expect(listPaymentsSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listPaymentsSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listPaymentsSchema.safeParse({ page: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getPaymentSchema
// ---------------------------------------------------------------------------
describe("getPaymentSchema", () => {
  it("accepts valid input", () => {
    expect(getPaymentSchema.safeParse({ paymentId: "pmt-123" }).success).toBe(true);
  });

  it("rejects missing paymentId", () => {
    expect(getPaymentSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty paymentId", () => {
    expect(getPaymentSchema.safeParse({ paymentId: "" }).success).toBe(false);
  });

  it("rejects wrong type", () => {
    expect(getPaymentSchema.safeParse({ paymentId: 123 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// paymentRowOutputSchema
// ---------------------------------------------------------------------------
describe("paymentRowOutputSchema", () => {
  const validRow = {
    bank_transaction_id: "btx-1",
    reference: "REF-001",
    status: "paid",
    type: "RECEIVE",
    total: 5000.0,
    currency_code: "USD",
    contact_name: "John Doe",
    date: "2024-06-01",
    is_reconciled: true,
    line_items_count: 3,
  };

  it("accepts a valid row", () => {
    expect(paymentRowOutputSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    expect(
      paymentRowOutputSchema.safeParse({
        ...validRow,
        reference: null,
        status: null,
        type: null,
        total: null,
        currency_code: null,
        contact_name: null,
        is_reconciled: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing bank_transaction_id", () => {
    const { bank_transaction_id: _, ...rest } = validRow;
    expect(paymentRowOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing date", () => {
    const { date: _, ...rest } = validRow;
    expect(paymentRowOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing line_items_count", () => {
    const { line_items_count: _, ...rest } = validRow;
    expect(paymentRowOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative line_items_count", () => {
    expect(
      paymentRowOutputSchema.safeParse({ ...validRow, line_items_count: -1 }).success,
    ).toBe(false);
  });

  it("rejects wrong type for bank_transaction_id", () => {
    expect(
      paymentRowOutputSchema.safeParse({ ...validRow, bank_transaction_id: 123 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listPaymentsOutputSchema
// ---------------------------------------------------------------------------
describe("listPaymentsOutputSchema", () => {
  const validResponse = {
    items: [
      {
        bank_transaction_id: "btx-1",
        reference: null,
        status: "paid",
        type: "RECEIVE",
        total: 5000.0,
        currency_code: "USD",
        contact_name: "Acme",
        date: "2024-06-01",
        is_reconciled: true,
        line_items_count: 3,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid response", () => {
    expect(listPaymentsOutputSchema.safeParse(validResponse).success).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      listPaymentsOutputSchema.safeParse({ ...validResponse, items: [], total: 0, totalPages: 0 }).success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    const { items: _, ...rest } = validResponse;
    expect(listPaymentsOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(listPaymentsOutputSchema.safeParse({ ...validResponse, total: -1 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listPaymentsOutputSchema.safeParse({ ...validResponse, page: 0 }).success).toBe(false);
  });

  it("rejects negative totalPages", () => {
    expect(listPaymentsOutputSchema.safeParse({ ...validResponse, totalPages: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// lineItemOutputSchema
// ---------------------------------------------------------------------------
describe("lineItemOutputSchema", () => {
  const validItem = {
    line_item_id: "li-1",
    account_code: "200",
    description: "Service fee",
    line_amount: 150.0,
    quantity: 1,
    unit_amount: 150.0,
  };

  it("accepts a valid line item", () => {
    expect(lineItemOutputSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    expect(
      lineItemOutputSchema.safeParse({
        ...validItem,
        account_code: null,
        description: null,
        line_amount: null,
        quantity: null,
        unit_amount: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing line_item_id", () => {
    const { line_item_id: _, ...rest } = validItem;
    expect(lineItemOutputSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// paymentContactOutputSchema
// ---------------------------------------------------------------------------
describe("paymentContactOutputSchema", () => {
  const validContact = { contact_id: "c-1", name: "Acme Corp" };

  it("accepts a valid contact", () => {
    expect(paymentContactOutputSchema.safeParse(validContact).success).toBe(true);
  });

  it("accepts nullable name", () => {
    expect(paymentContactOutputSchema.safeParse({ contact_id: "c-1", name: null }).success).toBe(true);
  });

  it("rejects missing contact_id", () => {
    const { contact_id: _, ...rest } = validContact;
    expect(paymentContactOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for contact_id", () => {
    expect(paymentContactOutputSchema.safeParse({ contact_id: 123, name: null }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// paymentNestedOutputSchema
// ---------------------------------------------------------------------------
describe("paymentNestedOutputSchema", () => {
  const validNested = {
    bank_transaction_id: "btx-1",
    reference: null,
    status: "paid",
    type: "RECEIVE",
    total: 5000.0,
    sub_total: 4500.0,
    total_tax: 500.0,
    currency_rate: 1.0,
    currency_code: "USD",
    line_amount_types: "Inclusive",
    has_attachments: false,
    is_reconciled: true,
    date: "2024-06-01",
    created_at: "2024-06-01T00:00:00Z",
    updated_at: "2024-06-01T00:00:00Z",
    contact: null,
  };

  it("accepts a valid nested payment", () => {
    expect(paymentNestedOutputSchema.safeParse(validNested).success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    expect(paymentNestedOutputSchema.safeParse(validNested).success).toBe(true);
  });

  it("accepts with contact object", () => {
    expect(
      paymentNestedOutputSchema.safeParse({
        ...validNested,
        contact: { contact_id: "c-1", name: "Acme" },
      }).success,
    ).toBe(true);
  });

  it("rejects missing bank_transaction_id", () => {
    const { bank_transaction_id: _, ...rest } = validNested;
    expect(paymentNestedOutputSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// metricOutputSchema
// ---------------------------------------------------------------------------
describe("metricOutputSchema", () => {
  const validMetric = { label: "Total", value: 5000, note: "In USD" };

  it("accepts a valid metric with number value", () => {
    expect(metricOutputSchema.safeParse(validMetric).success).toBe(true);
  });

  it("accepts metric with string value", () => {
    expect(
      metricOutputSchema.safeParse({ label: "Status", value: "paid", note: "" }).success,
    ).toBe(true);
  });

  it("rejects missing label", () => {
    const { label: _, ...rest } = validMetric;
    expect(metricOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing value", () => {
    const { value: _, ...rest } = validMetric;
    expect(metricOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing note", () => {
    const { note: _, ...rest } = validMetric;
    expect(metricOutputSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// paymentDetailOutputSchema
// ---------------------------------------------------------------------------
describe("paymentDetailOutputSchema", () => {
  const validDetail = {
    payment: null,
    line_items: [],
    metrics: [],
  };

  it("accepts a valid detail with null payment", () => {
    expect(paymentDetailOutputSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts with payment and line items", () => {
    expect(
      paymentDetailOutputSchema.safeParse({
        payment: {
          bank_transaction_id: "btx-1",
          reference: null,
          status: "paid",
          type: "RECEIVE",
          total: 5000.0,
          sub_total: 4500.0,
          total_tax: 500.0,
          currency_rate: 1.0,
          currency_code: "USD",
          line_amount_types: "Inclusive",
          has_attachments: false,
          is_reconciled: true,
          date: "2024-06-01",
          created_at: null,
          updated_at: null,
          contact: null,
        },
        line_items: [
          { line_item_id: "li-1", account_code: null, description: "Fee", line_amount: 5000, quantity: 1, unit_amount: 5000 },
        ],
        metrics: [{ label: "Total", value: 5000, note: "USD" }],
      }).success,
    ).toBe(true);
  });

  it("rejects missing payment", () => {
    const { payment: _, ...rest } = validDetail;
    expect(paymentDetailOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing line_items", () => {
    const { line_items: _, ...rest } = validDetail;
    expect(paymentDetailOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing metrics", () => {
    const { metrics: _, ...rest } = validDetail;
    expect(paymentDetailOutputSchema.safeParse(rest).success).toBe(false);
  });
});
