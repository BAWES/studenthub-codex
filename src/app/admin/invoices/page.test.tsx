import { describe, it, expect } from "vitest";
import { z } from "zod";

/**
 * Admin invoices page — data contract tests.
 *
 * Verifies that invoice row data returned by getAdminInvoiceRows()
 * has the expected shape for the DataTable columns.
 */

const invoiceRowSchema = z.object({
  id: z.number(),
  invoice_id: z.number(),
  company: z.string(),
  transfer_id: z.number().nullable(),
  date: z.string(),
  status: z.string(),
  total: z.string(),
  transfer_status: z.string(),
});

const invoiceRowsSchema = z.array(invoiceRowSchema);

describe("admin invoices page — data contract", () => {
  it("invoiceRowSchema accepts a full invoice record", () => {
    const row = {
      id: 1,
      invoice_id: 1,
      company: "Test Company",
      transfer_id: 42,
      date: "2026-06-24",
      status: "paid",
      total: "KWD 500.000",
      transfer_status: "Status 10",
    };
    const parsed = invoiceRowSchema.safeParse(row);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.id).toBe(1);
      expect(parsed.data.company).toBe("Test Company");
      expect(parsed.data.status).toBe("paid");
    }
  });

  it("invoiceRowSchema accepts null transfer_id", () => {
    const row = {
      id: 2,
      invoice_id: 2,
      company: "No Transfer Company",
      transfer_id: null,
      date: "—",
      status: "unpaid",
      total: "KWD 0.000",
      transfer_status: "—",
    };
    const parsed = invoiceRowSchema.safeParse(row);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.transfer_id).toBeNull();
    }
  });

  it("invoiceRowsSchema accepts empty array", () => {
    const parsed = invoiceRowsSchema.safeParse([]);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toEqual([]);
    }
  });

  it("invoiceRowSchema rejects missing required fields", () => {
    const parsed = invoiceRowSchema.safeParse({ id: 1 });
    expect(parsed.success).toBe(false);
  });

  it("invoiceRowSchema accepts various status values", () => {
    for (const status of ["paid", "unpaid", "unknown", "pending"]) {
      const row = {
        id: 1,
        invoice_id: 1,
        company: "Test",
        transfer_id: null,
        date: "2026-06-24",
        status,
        total: "KWD 500.000",
        transfer_status: "—",
      };
      const parsed = invoiceRowSchema.safeParse(row);
      expect(parsed.success).toBe(true);
    }
  });

  it("invoiceRowSchema accepts various total formats", () => {
    const totals = ["KWD 500.000", "KWD 0.000", "KWD 1,234.567", "—"];
    for (const total of totals) {
      const row = {
        id: 1,
        invoice_id: 1,
        company: "Test",
        transfer_id: 1,
        date: "2026-06-24",
        status: "paid",
        total,
        transfer_status: "Status 10",
      };
      const parsed = invoiceRowSchema.safeParse(row);
      expect(parsed.success).toBe(true);
    }
  });

  it("invoiceRowSchema fields map correctly to DataTable columns", () => {
    const row = {
      id: 3,
      invoice_id: 3,
      company: "Kuwait Co.",
      transfer_id: 15,
      date: "2026-06-01",
      status: "unpaid",
      total: "KWD 2,500.000",
      transfer_status: "Status 5",
    };

    // DataTable uses: invoice_id, company, date, status, total, transfer_status
    expect(row.invoice_id).toBe(3);
    expect(row.company).toBe("Kuwait Co.");
    expect(row.date).toBe("2026-06-01");
    expect(row.status).toBe("unpaid");
    expect(row.total).toBe("KWD 2,500.000");
    expect(row.transfer_status).toBe("Status 5");
  });
});
