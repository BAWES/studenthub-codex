import { describe, it, expect } from "vitest";
import {
  invoiceRowOutputSchema,
  listInvoicesOutputSchema,
  candidatePayoutOutputSchema,
  metricOutputSchema,
  invoiceNestedOutputSchema,
  invoiceDetailOutputSchema,
  invoiceMutationOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Output schema validation tests
// ---------------------------------------------------------------------------

describe("invoiceRowOutputSchema", () => {
  const validRow = {
    invoice_id: 1,
    transfer_id: 100,
    company_name: "Acme Corp",
    invoice_date: "2026-06-15",
    invoice_status: "unpaid",
    total: "1500.00",
    currency_code: "KWD",
  };

  it("accepts a valid invoice row", () => {
    expect(invoiceRowOutputSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts null optional fields", () => {
    expect(
      invoiceRowOutputSchema.safeParse({
        ...validRow,
        transfer_id: null,
        company_name: null,
        invoice_date: null,
        invoice_status: null,
        total: null,
        currency_code: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing invoice_id", () => {
    const { invoice_id: _, ...rest } = validRow;
    expect(invoiceRowOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for invoice_id", () => {
    expect(
      invoiceRowOutputSchema.safeParse({ ...validRow, invoice_id: "1" })
        .success,
    ).toBe(false);
  });
});

describe("listInvoicesOutputSchema", () => {
  const validList = {
    items: [
      {
        invoice_id: 1,
        transfer_id: null,
        company_name: "Acme Corp",
        invoice_date: null,
        invoice_status: "unpaid",
        total: "1500.00",
        currency_code: "KWD",
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid paginated result", () => {
    expect(listInvoicesOutputSchema.safeParse(validList).success).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      listInvoicesOutputSchema.safeParse({
        ...validList,
        items: [],
        total: 0,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects negative total", () => {
    expect(
      listInvoicesOutputSchema.safeParse({ ...validList, total: -1 }).success,
    ).toBe(false);
  });
});

describe("candidatePayoutOutputSchema", () => {
  const validPayout = {
    tc_id: 1,
    candidate_name: "John Doe",
    hours: 40,
    amount: "600.00",
    paid: 1,
  };

  it("accepts a valid payout entry", () => {
    expect(candidatePayoutOutputSchema.safeParse(validPayout).success).toBe(
      true,
    );
  });

  it("accepts null fields", () => {
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
});

describe("metricOutputSchema", () => {
  const validMetric = {
    label: "Total Invoices",
    value: 42,
    note: "Total invoices this month",
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

describe("invoiceNestedOutputSchema", () => {
  const validNested = {
    invoice_id: 1,
    transfer_id: 100,
    invoice_date: "2026-06-15",
    invoice_status: "unpaid",
    total: "1500.00",
    company_total: "1800.00",
    currency_code: "KWD",
    payment_received_on: "2026-06-20",
    company: {
      company_name: "Acme Corp",
      company_email: "billing@acme.com",
    },
  };

  it("accepts a valid invoice nested object", () => {
    expect(invoiceNestedOutputSchema.safeParse(validNested).success).toBe(true);
  });

  it("accepts null company and nullable fields", () => {
    expect(
      invoiceNestedOutputSchema.safeParse({
        ...validNested,
        company: null,
        transfer_id: null,
        invoice_date: null,
        payment_received_on: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing invoice_id", () => {
    const { invoice_id: _, ...rest } = validNested;
    expect(invoiceNestedOutputSchema.safeParse(rest).success).toBe(false);
  });
});

describe("invoiceDetailOutputSchema", () => {
  const validDetail = {
    invoice: {
      invoice_id: 1,
      transfer_id: null,
      invoice_date: null,
      invoice_status: "unpaid",
      total: "1500.00",
      company_total: null,
      currency_code: "KWD",
      payment_received_on: null,
      company: null,
    },
    candidate_payouts: [
      { tc_id: 1, candidate_name: "John", hours: 40, amount: "600.00", paid: 1 },
    ],
    metrics: [
      { label: "Total", value: 1500, note: "Total invoice amount" },
    ],
  };

  it("accepts a valid invoice detail", () => {
    expect(invoiceDetailOutputSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts null invoice", () => {
    expect(
      invoiceDetailOutputSchema.safeParse({
        ...validDetail,
        invoice: null,
        candidate_payouts: [],
      }).success,
    ).toBe(true);
  });

  it("rejects missing candidate_payouts", () => {
    const { candidate_payouts: _, ...rest } = validDetail;
    expect(invoiceDetailOutputSchema.safeParse(rest).success).toBe(false);
  });
});

describe("invoiceMutationOutputSchema", () => {
  it("accepts a valid mutation result", () => {
    expect(
      invoiceMutationOutputSchema.safeParse({ invoice_id: 42 }).success,
    ).toBe(true);
  });

  it("rejects missing invoice_id", () => {
    expect(invoiceMutationOutputSchema.safeParse({}).success).toBe(false);
  });

  it("rejects wrong type for invoice_id", () => {
    expect(
      invoiceMutationOutputSchema.safeParse({ invoice_id: "42" }).success,
    ).toBe(false);
  });
});
