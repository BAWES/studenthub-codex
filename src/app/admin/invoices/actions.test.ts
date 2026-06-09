import { describe, it, expect } from "vitest";
import {
  listInvoicesSchema,
  getInvoiceSchema,
} from "./actions";

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
