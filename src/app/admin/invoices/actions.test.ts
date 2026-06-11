import { describe, it, expect } from "vitest";
import {
  listInvoicesSchema,
  getInvoiceSchema,
  createInvoiceSchema,
  updateInvoiceSchema,
  deleteInvoiceSchema,
  invoiceRowSchema,
  invoiceDetailSchema,
  listInvoicesResultSchema,
  invoiceActionResponseSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests — pure unit tests, no DB required
// ---------------------------------------------------------------------------

describe("listInvoicesSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const r = listInvoicesSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts pagination and filter params", () => {
    const r = listInvoicesSchema.safeParse({
      page: 2,
      limit: 10,
      companyId: 5,
      status: "paid",
      dateFrom: "2026-01-01",
      dateTo: "2026-06-30",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
      expect(r.data.companyId).toBe(5);
      expect(r.data.status).toBe("paid");
      expect(r.data.dateFrom).toBe("2026-01-01");
      expect(r.data.dateTo).toBe("2026-06-30");
    }
  });

  it("rejects limit over 100", () => {
    expect(listInvoicesSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listInvoicesSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("accepts all valid invoice status values", () => {
    const valid = ["paid", "unpaid"];
    for (const s of valid) {
      expect(listInvoicesSchema.safeParse({ status: s }).success).toBe(true);
    }
  });

  it("rejects invalid status", () => {
    expect(listInvoicesSchema.safeParse({ status: "pending" }).success).toBe(false);
  });

  it("coerces string page/limit to numbers", () => {
    const r = listInvoicesSchema.safeParse({ page: "3", limit: "25" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(3);
      expect(r.data.limit).toBe(25);
    }
  });
});

describe("getInvoiceSchema", () => {
  it("accepts a valid invoice ID", () => {
    const r = getInvoiceSchema.safeParse({ invoiceId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.invoiceId).toBe(42);
    }
  });

  it("rejects negative ID", () => {
    expect(getInvoiceSchema.safeParse({ invoiceId: -1 }).success).toBe(false);
  });

  it("rejects zero", () => {
    expect(getInvoiceSchema.safeParse({ invoiceId: 0 }).success).toBe(false);
  });

  it("rejects non-numeric string", () => {
    expect(getInvoiceSchema.safeParse({ invoiceId: "abc" }).success).toBe(false);
  });

  it("coerces string number to int", () => {
    const r = getInvoiceSchema.safeParse({ invoiceId: "99" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.invoiceId).toBe(99);
    }
  });
});

// ---------------------------------------------------------------------------
// createInvoiceSchema
// ---------------------------------------------------------------------------

describe("createInvoiceSchema", () => {
  it("accepts minimal params (defaults only)", () => {
    const r = createInvoiceSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.invoice_status).toBe("unpaid");
    }
  });

  it("accepts all optional fields", () => {
    const r = createInvoiceSchema.safeParse({
      transfer_id: 1,
      invoice_date: "2026-06-10",
      invoice_status: "paid",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.transfer_id).toBe(1);
      expect(r.data.invoice_status).toBe("paid");
    }
  });

  it("rejects invalid status", () => {
    const r = createInvoiceSchema.safeParse({ invoice_status: "pending" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateInvoiceSchema
// ---------------------------------------------------------------------------

describe("updateInvoiceSchema", () => {
  it("accepts valid invoice ID with partial update", () => {
    const r = updateInvoiceSchema.safeParse({
      invoiceId: 1,
      invoice_status: "paid",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.invoiceId).toBe(1);
      expect(r.data.invoice_status).toBe("paid");
    }
  });

  it("accepts invoice ID only (no mutation fields)", () => {
    const r = updateInvoiceSchema.safeParse({ invoiceId: 42 });
    expect(r.success).toBe(true);
  });

  it("rejects missing invoiceId", () => {
    const r = updateInvoiceSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects zero invoiceId", () => {
    const r = updateInvoiceSchema.safeParse({ invoiceId: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const r = updateInvoiceSchema.safeParse({
      invoiceId: 1,
      invoice_status: "cancelled",
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteInvoiceSchema
// ---------------------------------------------------------------------------

describe("deleteInvoiceSchema", () => {
  it("accepts a valid invoice ID", () => {
    const r = deleteInvoiceSchema.safeParse({ invoiceId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.invoiceId).toBe(42);
    }
  });

  it("rejects missing invoiceId", () => {
    const r = deleteInvoiceSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects zero", () => {
    const r = deleteInvoiceSchema.safeParse({ invoiceId: 0 });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output validation schema tests
// ---------------------------------------------------------------------------

describe("invoiceRowSchema", () => {
  it("accepts a valid invoice row", () => {
    const r = invoiceRowSchema.safeParse({
      invoice_id: 1,
      transfer_id: 10,
      company_name: "Acme Corp",
      invoice_date: "2026-06-01T00:00:00.000Z",
      invoice_status: "paid",
      total: "1000.00",
      currency_code: "KWD",
    });
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const r = invoiceRowSchema.safeParse({
      invoice_id: 1,
      transfer_id: null,
      company_name: null,
      invoice_date: null,
      invoice_status: null,
      total: null,
      currency_code: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing invoice_id", () => {
    const r = invoiceRowSchema.safeParse({
      company_name: "Acme",
      invoice_date: null,
      invoice_status: null,
      total: null,
      currency_code: null,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-positive invoice_id", () => {
    const r = invoiceRowSchema.safeParse({
      invoice_id: 0,
      transfer_id: null,
      company_name: null,
      invoice_date: null,
      invoice_status: null,
      total: null,
      currency_code: null,
    });
    expect(r.success).toBe(false);
  });
});

describe("listInvoicesResultSchema", () => {
  it("accepts a valid paginated result", () => {
    const r = listInvoicesResultSchema.safeParse({
      items: [
        {
          invoice_id: 1,
          transfer_id: 10,
          company_name: "Acme",
          invoice_date: "2026-06-01T00:00:00.000Z",
          invoice_status: "paid",
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
  });

  it("accepts empty items array", () => {
    const r = listInvoicesResultSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    const r = listInvoicesResultSchema.safeParse({
      items: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing page", () => {
    const r = listInvoicesResultSchema.safeParse({
      items: [],
      total: 0,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });
});

describe("invoiceDetailSchema", () => {
  it("accepts a full invoice detail", () => {
    const r = invoiceDetailSchema.safeParse({
      invoice: {
        invoice_id: 1,
        transfer_id: 10,
        invoice_date: "2026-06-01T00:00:00.000Z",
        invoice_status: "paid",
        total: "1000.00",
        company_total: "800.00",
        currency_code: "KWD",
        payment_received_on: "2026-06-10T00:00:00.000Z",
        company: { company_name: "Acme Corp", company_email: "acme@test.com" },
      },
      candidate_payouts: [
        { tc_id: 1, candidate_name: "John Doe", hours: 40, amount: "500.00", paid: 1 },
      ],
      metrics: [
        { label: "Total", value: "1000.00", note: "KWD" },
        { label: "Paid", value: 1, note: "1 remaining" },
      ],
    });
    expect(r.success).toBe(true);
  });

  it("accepts null invoice (not found)", () => {
    const r = invoiceDetailSchema.safeParse({
      invoice: null,
      candidate_payouts: [],
      metrics: [],
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing candidate_payouts", () => {
    const r = invoiceDetailSchema.safeParse({
      invoice: null,
      metrics: [],
    });
    expect(r.success).toBe(false);
  });

  it("rejects invalid metric value type", () => {
    const r = invoiceDetailSchema.safeParse({
      invoice: null,
      candidate_payouts: [],
      metrics: [{ label: "Bad", value: true, note: "" }],
    });
    expect(r.success).toBe(false);
  });
});

describe("invoiceActionResponseSchema", () => {
  it("accepts a valid action response", () => {
    const r = invoiceActionResponseSchema.safeParse({ invoice_id: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.invoice_id).toBe(42);
    }
  });

  it("rejects missing invoice_id", () => {
    const r = invoiceActionResponseSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects zero invoice_id", () => {
    const r = invoiceActionResponseSchema.safeParse({ invoice_id: 0 });
    expect(r.success).toBe(false);
  });
});
