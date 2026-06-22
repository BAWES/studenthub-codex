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
    expect(listTransfersSchema.safeParse({}).success).toBe(true);
  });

  it("accepts explicit values", () => {
    expect(
      listTransfersSchema.safeParse({ page: 2, limit: 50, companyId: 1, status: 1 }).success,
    ).toBe(true);
  });

  it("rejects limit below 1", () => {
    expect(listTransfersSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listTransfersSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listTransfersSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects negative companyId", () => {
    expect(listTransfersSchema.safeParse({ companyId: -1 }).success).toBe(false);
  });

  it("rejects wrong type for status", () => {
    expect(listTransfersSchema.safeParse({ status: "pending" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getTransferSchema
// ---------------------------------------------------------------------------
describe("getTransferSchema", () => {
  it("accepts valid input", () => {
    expect(getTransferSchema.safeParse({ transferId: 1 }).success).toBe(true);
  });

  it("rejects missing transferId", () => {
    expect(getTransferSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero transferId", () => {
    expect(getTransferSchema.safeParse({ transferId: 0 }).success).toBe(false);
  });

  it("rejects negative transferId", () => {
    expect(getTransferSchema.safeParse({ transferId: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// approveTransferSchema
// ---------------------------------------------------------------------------
describe("approveTransferSchema", () => {
  it("accepts valid input", () => {
    expect(approveTransferSchema.safeParse({ transferId: 1 }).success).toBe(true);
  });

  it("rejects missing transferId", () => {
    expect(approveTransferSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero transferId", () => {
    expect(approveTransferSchema.safeParse({ transferId: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// rejectTransferSchema
// ---------------------------------------------------------------------------
describe("rejectTransferSchema", () => {
  it("accepts valid input", () => {
    expect(rejectTransferSchema.safeParse({ transferId: 1, reason: "Insufficient documentation" }).success).toBe(true);
  });

  it("rejects missing transferId", () => {
    expect(rejectTransferSchema.safeParse({ reason: "Reason" }).success).toBe(false);
  });

  it("rejects missing reason", () => {
    expect(rejectTransferSchema.safeParse({ transferId: 1 }).success).toBe(false);
  });

  it("rejects empty reason", () => {
    expect(rejectTransferSchema.safeParse({ transferId: 1, reason: "" }).success).toBe(false);
  });

  it("rejects reason exceeding 500 chars", () => {
    expect(rejectTransferSchema.safeParse({ transferId: 1, reason: "x".repeat(501) }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listTransfersResultSchema (output)
// ---------------------------------------------------------------------------
describe("listTransfersResultSchema", () => {
  const validResult = {
    items: [
      {
        id: 1,
        company: "ACME",
        period: "2024-01",
        status: "pending",
        statusCode: 0,
        total: "1000.00",
        currencyCode: "KWD",
        createdAt: "2024-01-01T00:00:00Z",
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid result", () => {
    expect(listTransfersResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    expect(
      listTransfersResultSchema.safeParse({
        ...validResult,
        items: [
          {
            id: 1,
            company: "ACME",
            period: "2024-01",
            status: "pending",
            statusCode: 0,
            total: null,
            currencyCode: null,
            createdAt: null,
          },
        ],
      }).success,
    ).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      listTransfersResultSchema.safeParse({ ...validResult, items: [], total: 0, totalPages: 0 }).success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    const { items: _, ...rest } = validResult;
    expect(listTransfersResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(listTransfersResultSchema.safeParse({ ...validResult, total: -1 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listTransfersResultSchema.safeParse({ ...validResult, page: 0 }).success).toBe(false);
  });

  it("rejects zero limit", () => {
    expect(listTransfersResultSchema.safeParse({ ...validResult, limit: 0 }).success).toBe(false);
  });

  it("rejects missing company", () => {
    const { company: _, ...itemRest } = validResult.items[0];
    expect(
      listTransfersResultSchema.safeParse({ ...validResult, items: [itemRest] }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// transferDetailResultSchema (output)
// ---------------------------------------------------------------------------
describe("transferDetailResultSchema", () => {
  const validDetail = {
    transfer: {
      transferId: 1,
      total: "5000.00",
      companyTotal: "3000.00",
      transferCost: "2000.00",
      status: "approved",
      statusLabel: "Approved",
      currencyCode: "KWD",
      startDate: "2024-01-01",
      endDate: "2024-02-01",
      paymentReceivedOn: null,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: null,
      companyName: "ACME",
      companyEmail: "acme@test.com",
    },
    candidates: [
      {
        tcId: 1,
        candidateName: "John Doe",
        hours: 40,
        amount: "400.00",
        paid: 1,
      },
    ],
    invoices: [
      {
        invoiceId: 1,
        invoiceDate: "2024-01-15",
        invoiceStatus: "paid",
      },
    ],
    metrics: [
      { label: "Total", value: "5000.00", note: "Overall total" },
    ],
  };

  it("accepts a valid detail", () => {
    expect(transferDetailResultSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts null transfer", () => {
    expect(
      transferDetailResultSchema.safeParse({
        ...validDetail,
        transfer: null,
      }).success,
    ).toBe(true);
  });

  it("accepts empty arrays", () => {
    expect(
      transferDetailResultSchema.safeParse({
        ...validDetail,
        candidates: [],
        invoices: [],
        metrics: [],
      }).success,
    ).toBe(true);
  });

  it("accepts nullable fields in transfer as null", () => {
    expect(
      transferDetailResultSchema.safeParse({
        transfer: {
          transferId: 1,
          total: null,
          companyTotal: null,
          transferCost: null,
          status: "pending",
          statusLabel: "Pending",
          currencyCode: null,
          startDate: null,
          endDate: null,
          paymentReceivedOn: null,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: null,
          companyName: null,
          companyEmail: null,
        },
        candidates: [],
        invoices: [],
        metrics: [],
      }).success,
    ).toBe(true);
  });

  it("accepts null fields in transferInvoiceSchema", () => {
    expect(
      transferDetailResultSchema.safeParse({
        ...validDetail,
        invoices: [{ invoiceId: 1, invoiceDate: null, invoiceStatus: null }],
      }).success,
    ).toBe(true);
  });

  it("rejects missing transfer", () => {
    const { transfer: _, ...rest } = validDetail;
    expect(transferDetailResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing candidates", () => {
    const { candidates: _, ...rest } = validDetail;
    expect(transferDetailResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing invoices", () => {
    const { invoices: _, ...rest } = validDetail;
    expect(transferDetailResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing metrics", () => {
    const { metrics: _, ...rest } = validDetail;
    expect(transferDetailResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for value in metric", () => {
    expect(
      transferDetailResultSchema.safeParse({
        ...validDetail,
        metrics: [{ label: "X", value: true, note: "" }],
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// transferActionResponseSchema (output)
// ---------------------------------------------------------------------------
describe("transferActionResponseSchema", () => {
  it("accepts success response", () => {
    expect(transferActionResponseSchema.safeParse({ success: true }).success).toBe(true);
  });

  it("accepts error response", () => {
    expect(
      transferActionResponseSchema.safeParse({ success: false, error: "Transfer not found" }).success,
    ).toBe(true);
  });

  it("rejects non-boolean success", () => {
    expect(transferActionResponseSchema.safeParse({ success: "true" }).success).toBe(false);
  });

  it("rejects missing success", () => {
    expect(transferActionResponseSchema.safeParse({ error: "Oops" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// adminTransferDetailResultSchema (output, legacy format)
// ---------------------------------------------------------------------------
describe("adminTransferDetailResultSchema", () => {
  const validAdminDetail = {
    transfer: {
      transfer_id: 1,
      total: "5000.00",
      company_total: "3000.00",
      transfer_cost: "2000.00",
      transfer_status: 1,
      currency_code: "KWD",
      start_date: new Date("2024-01-01"),
      end_date: new Date("2024-02-01"),
      payment_received_on: null,
      transfer_created_at: new Date("2024-01-01"),
      transfer_updated_at: new Date("2024-02-01"),
      company: { company_name: "ACME", company_email: "acme@test.com" },
      staff_transfer_transfer_created_byTostaff: { staff_name: "John" },
      staff_transfer_transfer_updated_byTostaff: null,
    },
    candidates: [{ id: 1, title: "Candidate", subtitle: "Sub", meta: "Meta" }],
    invoices: [{ id: 1, title: "Invoice", subtitle: "Sub", meta: "Meta" }],
    metrics: [{ label: "Total", value: 5000, note: "Overall" }],
    fileEntries: [],
  };

  it("accepts a valid admin detail", () => {
    expect(adminTransferDetailResultSchema.safeParse(validAdminDetail).success).toBe(true);
  });

  it("accepts null transfer", () => {
    expect(
      adminTransferDetailResultSchema.safeParse({
        ...validAdminDetail,
        transfer: null,
      }).success,
    ).toBe(true);
  });

  it("accepts empty arrays", () => {
    expect(
      adminTransferDetailResultSchema.safeParse({
        ...validAdminDetail,
        candidates: [],
        invoices: [],
        fileEntries: [],
      }).success,
    ).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    expect(
      adminTransferDetailResultSchema.safeParse({
        transfer: {
          transfer_id: 1,
          total: null,
          company_total: null,
          transfer_cost: null,
          transfer_status: 1,
          currency_code: null,
          start_date: null,
          end_date: null,
          payment_received_on: null,
          transfer_created_at: new Date("2024-01-01"),
          transfer_updated_at: new Date("2024-02-01"),
          company: null,
          staff_transfer_transfer_created_byTostaff: null,
          staff_transfer_transfer_updated_byTostaff: null,
        },
        candidates: [],
        invoices: [],
        metrics: [],
        fileEntries: [],
      }).success,
    ).toBe(true);
  });

  it("rejects missing transfer", () => {
    const { transfer: _, ...rest } = validAdminDetail;
    expect(adminTransferDetailResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing candidates", () => {
    const { candidates: _, ...rest } = validAdminDetail;
    expect(adminTransferDetailResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing fileEntries", () => {
    const { fileEntries: _, ...rest } = validAdminDetail;
    expect(adminTransferDetailResultSchema.safeParse(rest).success).toBe(false);
  });
});
