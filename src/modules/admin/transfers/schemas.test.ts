import { describe, it, expect } from "vitest";
import {
  listTransfersSchema,
  getTransferSchema,
  approveTransferSchema,
  rejectTransferSchema,
  listTransfersResultSchema,
  transferDetailResultSchema,
  transferActionResponseSchema,
  adminTransferDetailResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listTransfersSchema
// ---------------------------------------------------------------------------
describe("listTransfersSchema", () => {
  it("accepts empty input with defaults", () => {
    const r = listTransfersSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts optional filters", () => {
    const r = listTransfersSchema.safeParse({
      page: 2,
      limit: 10,
      companyId: 5,
      status: 1,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.companyId).toBe(5);
      expect(r.data.status).toBe(1);
    }
  });

  it("rejects limit above 100", () => {
    expect(listTransfersSchema.safeParse({ limit: 200 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getTransferSchema
// ---------------------------------------------------------------------------
describe("getTransferSchema", () => {
  it("accepts valid transferId", () => {
    const r = getTransferSchema.safeParse({ transferId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.transferId).toBe(42);
    }
  });

  it("coerces string transferId", () => {
    const r = getTransferSchema.safeParse({ transferId: "42" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.transferId).toBe(42);
    }
  });

  it("rejects non-positive transferId", () => {
    expect(getTransferSchema.safeParse({ transferId: 0 }).success).toBe(false);
    expect(getTransferSchema.safeParse({ transferId: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// approveTransferSchema
// ---------------------------------------------------------------------------
describe("approveTransferSchema", () => {
  it("accepts valid transferId", () => {
    expect(approveTransferSchema.safeParse({ transferId: 1 }).success).toBe(true);
  });

  it("rejects missing transferId", () => {
    expect(approveTransferSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// rejectTransferSchema
// ---------------------------------------------------------------------------
describe("rejectTransferSchema", () => {
  const valid = { transferId: 1, reason: "Insufficient funds" };

  it("accepts valid input", () => {
    expect(rejectTransferSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects empty reason", () => {
    expect(rejectTransferSchema.safeParse({ transferId: 1, reason: "" }).success).toBe(
      false
    );
  });

  it("rejects reason over 500 chars", () => {
    expect(
      rejectTransferSchema.safeParse({
        transferId: 1,
        reason: "x".repeat(501),
      }).success
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listTransfersResultSchema
// ---------------------------------------------------------------------------
describe("listTransfersResultSchema", () => {
  const valid = {
    items: [
      {
        id: 1,
        company: "Acme Corp",
        period: "January 2026",
        status: "Completed",
        statusCode: 1,
        total: "5000.00",
        currencyCode: "KWD",
        createdAt: "2026-01-15T00:00:00Z",
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts valid response", () => {
    expect(listTransfersResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable fields", () => {
    const r = listTransfersResultSchema.safeParse({
      ...valid,
      items: [
        {
          id: 1,
          company: "Acme Corp",
          period: "Jan 2026",
          status: "Pending",
          statusCode: 0,
          total: null,
          currencyCode: null,
          createdAt: null,
        },
      ],
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    expect(
      listTransfersResultSchema.safeParse({ ...valid, total: -1 }).success
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// transferDetailResultSchema
// ---------------------------------------------------------------------------
describe("transferDetailResultSchema", () => {
  const valid = {
    transfer: {
      transferId: 1,
      total: "5000.00",
      companyTotal: "4000.00",
      transferCost: "1000.00",
      status: "completed",
      statusLabel: "Completed",
      currencyCode: "KWD",
      startDate: "2026-01-01",
      endDate: "2026-01-31",
      paymentReceivedOn: null,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-31T00:00:00Z",
      companyName: "Acme Corp",
      companyEmail: "acme@example.com",
    },
    candidates: [
      { tcId: 1, candidateName: "John Doe", hours: 40, amount: "500", paid: 1 },
    ],
    invoices: [
      { invoiceId: 1, invoiceDate: "2026-01-31", invoiceStatus: "paid" },
    ],
    metrics: [{ label: "Total Hours", value: 40, note: "All approved" }],
  };

  it("accepts valid response", () => {
    expect(transferDetailResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts null transfer", () => {
    const r = transferDetailResultSchema.safeParse({
      ...valid,
      transfer: null,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty arrays", () => {
    const r = transferDetailResultSchema.safeParse({
      ...valid,
      candidates: [],
      invoices: [],
      metrics: [],
    });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// transferActionResponseSchema
// ---------------------------------------------------------------------------
describe("transferActionResponseSchema", () => {
  it("accepts success", () => {
    const r = transferActionResponseSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("accepts error with message", () => {
    const r = transferActionResponseSchema.safeParse({
      success: false,
      error: "Transfer not found",
    });
    expect(r.success).toBe(true);
  });

  it("rejects invalid", () => {
    expect(transferActionResponseSchema.safeParse({ success: "yes" }).success).toBe(
      false
    );
  });
});

// ---------------------------------------------------------------------------
// adminTransferDetailResultSchema
// ---------------------------------------------------------------------------
describe("adminTransferDetailResultSchema", () => {
  const valid = {
    transfer: {
      transfer_id: 1,
      total: "5000.00",
      company_total: "4000.00",
      transfer_cost: "1000.00",
      transfer_status: 1,
      currency_code: "KWD",
      start_date: new Date("2026-01-01"),
      end_date: new Date("2026-01-31"),
      payment_received_on: null,
      transfer_created_at: new Date("2026-01-01"),
      transfer_updated_at: new Date("2026-01-31"),
      company: { company_name: "Acme Corp", company_email: "acme@example.com" },
      staff_transfer_transfer_created_byTostaff: { staff_name: "Alice" },
      staff_transfer_transfer_updated_byTostaff: { staff_name: "Bob" },
    },
    candidates: [{ id: 1, title: "John Doe", subtitle: "Engineer", meta: "40h" }],
    invoices: [{ id: 1, title: "INV-001", subtitle: "January", meta: "5000 KWD" }],
    metrics: [{ label: "Total", value: "5000", note: "All approved" }],
    fileEntries: [],
  };

  it("accepts valid response", () => {
    expect(adminTransferDetailResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts null transfer and empty arrays", () => {
    const r = adminTransferDetailResultSchema.safeParse({
      transfer: null,
      candidates: [],
      invoices: [],
      metrics: [],
      fileEntries: [],
    });
    expect(r.success).toBe(true);
  });

  it("accepts numeric metric value", () => {
    const r = adminTransferDetailResultSchema.safeParse({
      ...valid,
      metrics: [{ label: "Count", value: 42, note: "items" }],
    });
    expect(r.success).toBe(true);
  });
});