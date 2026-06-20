import { describe, it, expect } from "vitest";
import {
  paymentRowOutputSchema,
  listPaymentsOutputSchema,
  lineItemOutputSchema,
  paymentContactOutputSchema,
  paymentNestedOutputSchema,
  metricOutputSchema,
  paymentDetailOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Output schema validation tests
// ---------------------------------------------------------------------------

describe("paymentRowOutputSchema", () => {
  const validRow = {
    bank_transaction_id: "txn_abc123",
    reference: "INV-2026-001",
    status: "completed",
    type: "payment",
    total: 1500.0,
    currency_code: "KWD",
    contact_name: "Acme Corp",
    date: "2026-06-15",
    is_reconciled: true,
    line_items_count: 3,
  };

  it("accepts a valid payment row", () => {
    expect(paymentRowOutputSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts null optional fields", () => {
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

  it("rejects negative line_items_count", () => {
    expect(
      paymentRowOutputSchema.safeParse({
        ...validRow,
        line_items_count: -1,
      }).success,
    ).toBe(false);
  });

  it("rejects wrong type for is_reconciled", () => {
    expect(
      paymentRowOutputSchema.safeParse({
        ...validRow,
        is_reconciled: "true",
      }).success,
    ).toBe(false);
  });
});

describe("listPaymentsOutputSchema", () => {
  const validList = {
    items: [
      {
        bank_transaction_id: "txn_abc123",
        reference: null,
        status: "completed",
        type: "payment",
        total: 1500.0,
        currency_code: "KWD",
        contact_name: null,
        date: "2026-06-15",
        is_reconciled: true,
        line_items_count: 3,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid paginated result", () => {
    expect(listPaymentsOutputSchema.safeParse(validList).success).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      listPaymentsOutputSchema.safeParse({
        ...validList,
        items: [],
        total: 0,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects negative total", () => {
    expect(
      listPaymentsOutputSchema.safeParse({ ...validList, total: -1 }).success,
    ).toBe(false);
  });
});

describe("lineItemOutputSchema", () => {
  const validItem = {
    line_item_id: "li_abc123",
    account_code: "200",
    description: "Consulting services",
    line_amount: 500.0,
    quantity: 1,
    unit_amount: 500.0,
  };

  it("accepts a valid line item", () => {
    expect(lineItemOutputSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts null fields", () => {
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

describe("paymentContactOutputSchema", () => {
  const validContact = {
    contact_id: "cnt_123",
    name: "Acme Corp",
  };

  it("accepts a valid contact", () => {
    expect(paymentContactOutputSchema.safeParse(validContact).success).toBe(
      true,
    );
  });

  it("accepts null name", () => {
    expect(
      paymentContactOutputSchema.safeParse({
        ...validContact,
        name: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing contact_id", () => {
    const { contact_id: _, ...rest } = validContact;
    expect(paymentContactOutputSchema.safeParse(rest).success).toBe(false);
  });
});

describe("paymentNestedOutputSchema", () => {
  const validPayment = {
    bank_transaction_id: "txn_abc123",
    reference: "INV-2026-001",
    status: "completed",
    type: "payment",
    total: 1500.0,
    sub_total: 1500.0,
    total_tax: 0,
    currency_rate: 1.0,
    currency_code: "KWD",
    line_amount_types: "Exclusive",
    has_attachments: false,
    is_reconciled: true,
    date: "2026-06-15",
    created_at: "2026-06-15T10:00:00",
    updated_at: "2026-06-15T10:00:00",
    contact: { contact_id: "cnt_123", name: "Acme Corp" },
  };

  it("accepts a valid payment nested object", () => {
    expect(paymentNestedOutputSchema.safeParse(validPayment).success).toBe(
      true,
    );
  });

  it("accepts null optional fields", () => {
    expect(
      paymentNestedOutputSchema.safeParse({
        ...validPayment,
        contact: null,
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
      }).success,
    ).toBe(true);
  });

  it("rejects missing bank_transaction_id", () => {
    const { bank_transaction_id: _, ...rest } = validPayment;
    expect(paymentNestedOutputSchema.safeParse(rest).success).toBe(false);
  });
});

describe("metricOutputSchema", () => {
  const validMetric = {
    label: "Total Payments",
    value: 10000,
    note: "Total payments this month",
  };

  it("accepts a valid metric with number value", () => {
    expect(metricOutputSchema.safeParse(validMetric).success).toBe(true);
  });

  it("accepts a metric with string value", () => {
    expect(
      metricOutputSchema.safeParse({
        ...validMetric,
        value: "Active",
      }).success,
    ).toBe(true);
  });

  it("rejects missing label", () => {
    const { label: _, ...rest } = validMetric;
    expect(metricOutputSchema.safeParse(rest).success).toBe(false);
  });
});

describe("paymentDetailOutputSchema", () => {
  const validDetail = {
    payment: {
      bank_transaction_id: "txn_abc123",
      reference: null,
      status: "completed",
      type: "payment",
      total: 1500.0,
      sub_total: null,
      total_tax: null,
      currency_rate: null,
      currency_code: "KWD",
      line_amount_types: null,
      has_attachments: false,
      is_reconciled: true,
      date: "2026-06-15",
      created_at: null,
      updated_at: null,
      contact: null,
    },
    line_items: [
      {
        line_item_id: "li_1",
        account_code: null,
        description: null,
        line_amount: 500.0,
        quantity: null,
        unit_amount: null,
      },
    ],
    metrics: [{ label: "Total", value: 1500, note: "Amount" }],
  };

  it("accepts a valid payment detail", () => {
    expect(paymentDetailOutputSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts null payment", () => {
    expect(
      paymentDetailOutputSchema.safeParse({
        ...validDetail,
        payment: null,
        line_items: [],
      }).success,
    ).toBe(true);
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
