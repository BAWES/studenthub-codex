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
// Schema tests — pure unit tests, no DB required
// ---------------------------------------------------------------------------

describe("listTransfersSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const r = listTransfersSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts pagination and filter params", () => {
    const r = listTransfersSchema.safeParse({ page: 2, limit: 10, companyId: 5, status: 10 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
      expect(r.data.companyId).toBe(5);
      expect(r.data.status).toBe(10);
    }
  });

  it("rejects limit over 100", () => {
    expect(listTransfersSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listTransfersSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("rejects negative companyId", () => {
    expect(listTransfersSchema.safeParse({ companyId: -5 }).success).toBe(false);
  });

  it("coerces string values to numbers", () => {
    const r = listTransfersSchema.safeParse({ page: "2", limit: "15", companyId: "3" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(15);
      expect(r.data.companyId).toBe(3);
    }
  });
});

describe("getTransferSchema", () => {
  it("accepts a valid positive transfer ID", () => {
    const r = getTransferSchema.safeParse({ transferId: 42 });
    expect(r.success).toBe(true);
  });

  it("rejects zero ID", () => {
    expect(getTransferSchema.safeParse({ transferId: 0 }).success).toBe(false);
  });

  it("rejects negative ID", () => {
    expect(getTransferSchema.safeParse({ transferId: -1 }).success).toBe(false);
  });

  it("rejects non-numeric ID", () => {
    expect(getTransferSchema.safeParse({ transferId: "abc" }).success).toBe(false);
  });

  it("coerces string transferId to number", () => {
    const r = getTransferSchema.safeParse({ transferId: "99" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.transferId).toBe(99);
    }
  });
});

describe("approveTransferSchema", () => {
  it("accepts a valid transfer ID", () => {
    const r = approveTransferSchema.safeParse({ transferId: 7 });
    expect(r.success).toBe(true);
  });

  it("rejects missing transferId", () => {
    expect(approveTransferSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero transferId", () => {
    expect(approveTransferSchema.safeParse({ transferId: 0 }).success).toBe(false);
  });
});

describe("rejectTransferSchema", () => {
  it("accepts valid transfer ID and reason", () => {
    const r = rejectTransferSchema.safeParse({ transferId: 7, reason: "Incorrect period dates" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.reason).toBe("Incorrect period dates");
    }
  });

  it("rejects missing reason", () => {
    expect(rejectTransferSchema.safeParse({ transferId: 7 }).success).toBe(false);
  });

  it("rejects empty reason", () => {
    expect(rejectTransferSchema.safeParse({ transferId: 7, reason: "" }).success).toBe(false);
  });

  it("rejects reason exceeding 500 chars", () => {
    const longReason = "x".repeat(501);
    expect(rejectTransferSchema.safeParse({ transferId: 7, reason: longReason }).success).toBe(false);
  });

  it("rejects missing transferId", () => {
    expect(rejectTransferSchema.safeParse({ reason: "No reason" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("listTransfersResultSchema", () => {
  it("validates a valid paginated response", () => {
    const r = listTransfersResultSchema.safeParse({
      items: [
        {
          id: 1,
          company: "ACME Corp",
          period: "Jan 1 – Jan 15",
          status: "Pending",
          statusCode: 10,
          total: "5000.000",
          currencyCode: "KWD",
          createdAt: "2024-01-01T00:00:00.000Z",
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative page", () => {
    const r = listTransfersResultSchema.safeParse({
      items: [],
      total: 0,
      page: -1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("validates empty items array", () => {
    const r = listTransfersResultSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing items", () => {
    const r = listTransfersResultSchema.safeParse({
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });
});

describe("transferDetailResultSchema", () => {
  it("validates a full transfer detail", () => {
    const r = transferDetailResultSchema.safeParse({
      transfer: {
        transferId: 1,
        total: "5000.000",
        companyTotal: "6000.000",
        transferCost: "1000.000",
        status: "Pending",
        statusLabel: "Pending",
        currencyCode: "KWD",
        startDate: "2024-01-01T00:00:00.000Z",
        endDate: "2024-01-15T00:00:00.000Z",
        paymentReceivedOn: null,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: null,
        companyName: "ACME Corp",
        companyEmail: "acme@test.com",
      },
      candidates: [
        {
          tcId: 1,
          candidateName: "John Doe",
          hours: 40,
          amount: "500.000",
          paid: 1,
        },
      ],
      invoices: [
        {
          invoiceId: 1,
          invoiceDate: "2024-01-10T00:00:00.000Z",
          invoiceStatus: "Status 1",
        },
      ],
      metrics: [
        { label: "Candidate Payouts", value: 1, note: "Transfers to candidates" },
      ],
    });
    expect(r.success).toBe(true);
  });

  it("validates transfer as null", () => {
    const r = transferDetailResultSchema.safeParse({
      transfer: null,
      candidates: [],
      invoices: [],
      metrics: [],
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing transfer field", () => {
    const r = transferDetailResultSchema.safeParse({
      candidates: [],
      invoices: [],
      metrics: [],
    });
    expect(r.success).toBe(false);
  });
});

describe("transferActionResponseSchema", () => {
  it("validates a success response", () => {
    const r = transferActionResponseSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("validates an error response", () => {
    const r = transferActionResponseSchema.safeParse({
      success: false,
      error: "Transfer not found",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing success field", () => {
    const r = transferActionResponseSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});

describe("adminTransferDetailResultSchema", () => {
  it("validates a full admin transfer detail", () => {
    const r = adminTransferDetailResultSchema.safeParse({
      transfer: {
        transfer_id: 1,
        total: "5000.000",
        company_total: "6000.000",
        transfer_cost: "1000.000",
        transfer_status: 10,
        currency_code: "KWD",
        start_date: new Date("2024-01-01"),
        end_date: new Date("2024-01-15"),
        payment_received_on: null,
        transfer_created_at: new Date("2024-01-01"),
        transfer_updated_at: new Date("2024-01-01"),
        company: { company_name: "ACME", company_email: "acme@test.com" },
        staff_transfer_transfer_created_byTostaff: null,
        staff_transfer_transfer_updated_byTostaff: null,
      },
      candidates: [
        { id: 1, title: "John Doe", subtitle: "Amount: 500", meta: "" },
      ],
      invoices: [
        { id: 1, title: "Invoice #1", subtitle: "Status 1", meta: "2024-01-10" },
      ],
      metrics: [
        { label: "Candidate Payouts", value: 1, note: "Transfers to candidates" },
      ],
      fileEntries: [],
    });
    expect(r.success).toBe(true);
  });

  it("validates transfer as null", () => {
    const r = adminTransferDetailResultSchema.safeParse({
      transfer: null,
      candidates: [],
      invoices: [],
      metrics: [],
      fileEntries: [],
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing fileEntries", () => {
    const r = adminTransferDetailResultSchema.safeParse({
      transfer: null,
      candidates: [],
      invoices: [],
      metrics: [],
    });
    expect(r.success).toBe(false);
  });
});
