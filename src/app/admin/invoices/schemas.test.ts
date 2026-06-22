import { describe, it, expect } from "vitest";
import {
  listInvoicesSchema,
  getInvoiceSchema,
  createInvoiceSchema,
  updateInvoiceSchema,
  deleteInvoiceSchema,
  invoiceRowOutputSchema,
  listInvoicesOutputSchema,
  candidatePayoutOutputSchema,
  metricOutputSchema,
  invoiceNestedOutputSchema,
  invoiceDetailOutputSchema,
  invoiceMutationOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listInvoicesSchema
// ---------------------------------------------------------------------------
describe("listInvoicesSchema", () => {
  it("accepts empty input with defaults", () => {
    expect(listInvoicesSchema.safeParse({}).success).toBe(true);
  });

  it("accepts explicit values", () => {
    expect(
      listInvoicesSchema.safeParse({
        page: 2,
        limit: 50,
        companyId: 5,
        status: "paid",
        dateFrom: "2024-01-01",
        dateTo: "2024-12-31",
      }).success,
    ).toBe(true);
  });

  it("accepts unpaid status", () => {
    expect(listInvoicesSchema.safeParse({ status: "unpaid" }).success).toBe(true);
  });

  it("rejects limit below 1", () => {
    expect(listInvoicesSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listInvoicesSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listInvoicesSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects invalid status", () => {
    expect(listInvoicesSchema.safeParse({ status: "pending" }).success).toBe(false);
  });

  it("rejects zero companyId", () => {
    expect(listInvoicesSchema.safeParse({ companyId: 0 }).success).toBe(false);
  });

  it("rejects negative companyId", () => {
    expect(listInvoicesSchema.safeParse({ companyId: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getInvoiceSchema
// ---------------------------------------------------------------------------
describe("getInvoiceSchema", () => {
  it("accepts valid input", () => {
    expect(getInvoiceSchema.safeParse({ invoiceId: 123 }).success).toBe(true);
  });

  it("accepts coerced string", () => {
    expect(getInvoiceSchema.safeParse({ invoiceId: "123" }).success).toBe(true);
  });

  it("rejects missing invoiceId", () => {
    expect(getInvoiceSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero invoiceId", () => {
    expect(getInvoiceSchema.safeParse({ invoiceId: 0 }).success).toBe(false);
  });

  it("rejects negative invoiceId", () => {
    expect(getInvoiceSchema.safeParse({ invoiceId: -1 }).success).toBe(false);
  });

  it("rejects non-numeric string", () => {
    expect(getInvoiceSchema.safeParse({ invoiceId: "abc" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createInvoiceSchema
// ---------------------------------------------------------------------------
describe("createInvoiceSchema", () => {
  it("accepts empty input (all optional)", () => {
    expect(createInvoiceSchema.safeParse({}).success).toBe(true);
  });

  it("accepts with all fields", () => {
    expect(
      createInvoiceSchema.safeParse({
        transfer_id: 1,
        invoice_date: "2024-06-01",
        invoice_status: "paid",
      }).success,
    ).toBe(true);
  });

  it("accepts unpaid status (default)", () => {
    expect(
      createInvoiceSchema.safeParse({ invoice_status: "unpaid" }).success,
    ).toBe(true);
  });

  it("rejects invalid invoice_status", () => {
    expect(
      createInvoiceSchema.safeParse({ invoice_status: "cancelled" }).success,
    ).toBe(false);
  });

  it("rejects zero transfer_id", () => {
    expect(createInvoiceSchema.safeParse({ transfer_id: 0 }).success).toBe(false);
  });

  it("rejects negative transfer_id", () => {
    expect(createInvoiceSchema.safeParse({ transfer_id: -1 }).success).toBe(false);
  });

  it("rejects non-integer transfer_id", () => {
    expect(createInvoiceSchema.safeParse({ transfer_id: 1.5 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateInvoiceSchema
// ---------------------------------------------------------------------------
describe("updateInvoiceSchema", () => {
  it("accepts minimal input", () => {
    expect(updateInvoiceSchema.safeParse({ invoiceId: 123 }).success).toBe(true);
  });

  it("accepts full input", () => {
    expect(
      updateInvoiceSchema.safeParse({
        invoiceId: 123,
        transfer_id: 5,
        invoice_date: "2024-06-01",
        invoice_status: "paid",
      }).success,
    ).toBe(true);
  });

  it("rejects missing invoiceId", () => {
    expect(updateInvoiceSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero invoiceId", () => {
    expect(updateInvoiceSchema.safeParse({ invoiceId: 0 }).success).toBe(false);
  });

  it("rejects invalid invoice_status", () => {
    expect(
      updateInvoiceSchema.safeParse({ invoiceId: 1, invoice_status: "bad" }).success,
    ).toBe(false);
  });

  it("rejects zero transfer_id", () => {
    expect(
      updateInvoiceSchema.safeParse({ invoiceId: 1, transfer_id: 0 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteInvoiceSchema
// ---------------------------------------------------------------------------
describe("deleteInvoiceSchema", () => {
  it("accepts valid input", () => {
    expect(deleteInvoiceSchema.safeParse({ invoiceId: 123 }).success).toBe(true);
  });

  it("rejects missing invoiceId", () => {
    expect(deleteInvoiceSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero invoiceId", () => {
    expect(deleteInvoiceSchema.safeParse({ invoiceId: 0 }).success).toBe(false);
  });

  it("rejects negative invoiceId", () => {
    expect(deleteInvoiceSchema.safeParse({ invoiceId: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// invoiceRowOutputSchema
// ---------------------------------------------------------------------------
describe("invoiceRowOutputSchema", () => {
  const validRow = {
    invoice_id: 1,
    transfer_id: null,
    company_name: "Acme Corp",
    invoice_date: null,
    invoice_status: "paid",
    total: null,
    currency_code: "USD",
  };

  it("accepts a valid row", () => {
    expect(invoiceRowOutputSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    expect(invoiceRowOutputSchema.safeParse(validRow).success).toBe(true);
  });

  it("rejects missing invoice_id", () => {
    const { invoice_id: _, ...rest } = validRow;
    expect(invoiceRowOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for invoice_id", () => {
    expect(invoiceRowOutputSchema.safeParse({ ...validRow, invoice_id: "abc" }).success).toBe(false);
  });

  it("rejects wrong type for company_name", () => {
    expect(invoiceRowOutputSchema.safeParse({ ...validRow, company_name: 123 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listInvoicesOutputSchema
// ---------------------------------------------------------------------------
describe("listInvoicesOutputSchema", () => {
  const validResponse = {
    items: [
      {
        invoice_id: 1,
        transfer_id: null,
        company_name: "Acme Corp",
        invoice_date: null,
        invoice_status: "paid",
        total: "1000.00",
        currency_code: "USD",
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid response", () => {
    expect(listInvoicesOutputSchema.safeParse(validResponse).success).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      listInvoicesOutputSchema.safeParse({ ...validResponse, items: [], total: 0, totalPages: 0 }).success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    const { items: _, ...rest } = validResponse;
    expect(listInvoicesOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(listInvoicesOutputSchema.safeParse({ ...validResponse, total: -1 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listInvoicesOutputSchema.safeParse({ ...validResponse, page: 0 }).success).toBe(false);
  });

  it("rejects negative totalPages", () => {
    expect(listInvoicesOutputSchema.safeParse({ ...validResponse, totalPages: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// candidatePayoutOutputSchema
// ---------------------------------------------------------------------------
describe("candidatePayoutOutputSchema", () => {
  const validPayout = {
    tc_id: 42,
    candidate_name: "John Doe",
    hours: 8.5,
    amount: "500.00",
    paid: 1,
  };

  it("accepts a valid payout", () => {
    expect(candidatePayoutOutputSchema.safeParse(validPayout).success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    expect(
      candidatePayoutOutputSchema.safeParse({
        ...validPayout,
        candidate_name: null,
        hours: null,
        amount: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing tc_id", () => {
    const { tc_id: _, ...rest } = validPayout;
    expect(candidatePayoutOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing paid", () => {
    const { paid: _, ...rest } = validPayout;
    expect(candidatePayoutOutputSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// metricOutputSchema
// ---------------------------------------------------------------------------
describe("metricOutputSchema", () => {
  const validMetric = { label: "Total", value: 1000, note: "In USD" };

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
// invoiceNestedOutputSchema
// ---------------------------------------------------------------------------
describe("invoiceNestedOutputSchema", () => {
  const validNested = {
    invoice_id: 1,
    transfer_id: null,
    invoice_date: null,
    invoice_status: "paid",
    total: "1000.00",
    company_total: null,
    currency_code: "USD",
    payment_received_on: null,
    company: null,
  };

  it("accepts a valid nested invoice", () => {
    expect(invoiceNestedOutputSchema.safeParse(validNested).success).toBe(true);
  });

  it("accepts with company object", () => {
    expect(
      invoiceNestedOutputSchema.safeParse({
        ...validNested,
        company: { company_name: "Acme", company_email: "acme@example.com" },
      }).success,
    ).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    expect(invoiceNestedOutputSchema.safeParse(validNested).success).toBe(true);
  });

  it("rejects missing invoice_id", () => {
    const { invoice_id: _, ...rest } = validNested;
    expect(invoiceNestedOutputSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// invoiceDetailOutputSchema
// ---------------------------------------------------------------------------
describe("invoiceDetailOutputSchema", () => {
  const validDetail = {
    invoice: null,
    candidate_payouts: [],
    metrics: [],
  };

  it("accepts a valid detail with null invoice", () => {
    expect(invoiceDetailOutputSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts with invoice and payouts", () => {
    expect(
      invoiceDetailOutputSchema.safeParse({
        invoice: {
          invoice_id: 1,
          transfer_id: null,
          invoice_date: null,
          invoice_status: "paid",
          total: "1000.00",
          company_total: null,
          currency_code: "USD",
          payment_received_on: null,
          company: null,
        },
        candidate_payouts: [
          { tc_id: 1, candidate_name: "Jane", hours: 10, amount: "500", paid: 1 },
        ],
        metrics: [{ label: "Total", value: 1000, note: "USD" }],
      }).success,
    ).toBe(true);
  });

  it("rejects missing invoice", () => {
    const { invoice: _, ...rest } = validDetail;
    expect(invoiceDetailOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing candidate_payouts", () => {
    const { candidate_payouts: _, ...rest } = validDetail;
    expect(invoiceDetailOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing metrics", () => {
    const { metrics: _, ...rest } = validDetail;
    expect(invoiceDetailOutputSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// invoiceMutationOutputSchema
// ---------------------------------------------------------------------------
describe("invoiceMutationOutputSchema", () => {
  it("accepts a valid mutation output", () => {
    expect(invoiceMutationOutputSchema.safeParse({ invoice_id: 42 }).success).toBe(true);
  });

  it("rejects missing invoice_id", () => {
    expect(invoiceMutationOutputSchema.safeParse({}).success).toBe(false);
  });

  it("rejects wrong type for invoice_id", () => {
    expect(invoiceMutationOutputSchema.safeParse({ invoice_id: "abc" }).success).toBe(false);
  });
});
