import { describe, it, expect } from "vitest";
import {
  listInvoicesSchema,
  getInvoiceSchema,
  createInvoiceSchema,
  updateInvoiceSchema,
  deleteInvoiceSchema,
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
