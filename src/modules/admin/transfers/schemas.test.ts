import { describe, it, expect } from "vitest";
import {
  listTransfersResultSchema,
  transferDetailResultSchema,
  transferActionResponseSchema,
  adminTransferDetailResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listTransfersResultSchema
// ---------------------------------------------------------------------------
describe("listTransfersResultSchema", () => {
  const validRow = {
    id: 42,
    company: "Acme Corp",
    period: "2026-06",
    status: "pending",
    statusCode: 1,
    total: "1500.00",
    currencyCode: "KWD",
    createdAt: "2026-06-14T10:00:00.000Z",
  };

  const validResult = {
    items: [validRow],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid list result with one item", () => {
    expect(listTransfersResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      listTransfersResultSchema.safeParse({ ...validResult, items: [], total: 0, totalPages: 0 }).success,
    ).toBe(true);
  });

  it("accepts nullable fields on row", () => {
    const rowNullFields = { ...validRow, total: null, currencyCode: null, createdAt: null };
    expect(
      listTransfersResultSchema.safeParse({ ...validResult, items: [rowNullFields] }).success,
    ).toBe(true);
  });

  it("accepts multiple pages", () => {
    const manyItems = Array.from({ length: 5 }, (_, i) => ({
      ...validRow,
      id: i + 1,
      company: `Company ${i + 1}`,
    }));
    expect(
      listTransfersResultSchema.safeParse({
        items: manyItems,
        total: 100,
        page: 3,
        limit: 20,
        totalPages: 5,
      }).success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    const { items: _, ...rest } = validResult;
    expect(listTransfersResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-array items", () => {
    expect(listTransfersResultSchema.safeParse({ ...validResult, items: "not-array" }).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(listTransfersResultSchema.safeParse({ ...validResult, total: -1 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listTransfersResultSchema.safeParse({ ...validResult, page: 0 }).success).toBe(false);
  });

  it("rejects missing totalPages", () => {
    const { totalPages: _, ...rest } = validResult;
    expect(listTransfersResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative totalPages", () => {
    expect(listTransfersResultSchema.safeParse({ ...validResult, totalPages: -1 }).success).toBe(false);
  });

  it("rejects non-integer id", () => {
    expect(
      listTransfersResultSchema.safeParse({
        ...validResult,
        items: [{ ...validRow, id: 42.5 }],
      }).success,
    ).toBe(false);
  });

  it("accepts empty company string (schema uses bare z.string())", () => {
    expect(
      listTransfersResultSchema.safeParse({
        ...validResult,
        items: [{ ...validRow, company: "" }],
      }).success,
    ).toBe(true);
  });

  it("accepts empty status string (schema uses bare z.string())", () => {
    expect(
      listTransfersResultSchema.safeParse({
        ...validResult,
        items: [{ ...validRow, status: "" }],
      }).success,
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// transferDetailResultSchema
// ---------------------------------------------------------------------------
describe("transferDetailResultSchema", () => {
  const validTransfer = {
    transferId: 42,
    total: "1500.00",
    companyTotal: "1800.00",
    transferCost: "300.00",
    status: "approved",
    statusLabel: "Approved",
    currencyCode: "KWD",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    paymentReceivedOn: "2026-07-01",
    createdAt: "2026-06-14T10:00:00.000Z",
    updatedAt: "2026-06-15T12:00:00.000Z",
    companyName: "Acme Corp",
    companyEmail: "billing@acme.com",
  };

  const validCandidate = {
    tcId: 1,
    candidateName: "John Doe",
    hours: 40,
    amount: "500.00",
    paid: 1,
  };

  const validInvoice = {
    invoiceId: 101,
    invoiceDate: "2026-06-30",
    invoiceStatus: "paid",
  };

  const validMetric = {
    label: "Total Transfers",
    value: 42,
    note: "This month",
  };

  const validDetail = {
    transfer: validTransfer,
    candidates: [validCandidate],
    invoices: [validInvoice],
    metrics: [validMetric],
  };

  it("accepts a valid transfer detail", () => {
    expect(transferDetailResultSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts null transfer (not found)", () => {
    expect(
      transferDetailResultSchema.safeParse({ ...validDetail, transfer: null }).success,
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

  it("accepts nullable fields on transfer", () => {
    const nullableTransfer = {
      transferId: 42,
      total: null,
      companyTotal: null,
      transferCost: null,
      status: "pending",
      statusLabel: "Pending",
      currencyCode: null,
      startDate: null,
      endDate: null,
      paymentReceivedOn: null,
      createdAt: "2026-06-14T10:00:00.000Z",
      updatedAt: null,
      companyName: null,
      companyEmail: null,
    };
    expect(
      transferDetailResultSchema.safeParse({
        ...validDetail,
        transfer: nullableTransfer,
      }).success,
    ).toBe(true);
  });

  it("rejects missing transfer field", () => {
    const { transfer: _, ...rest } = validDetail;
    expect(transferDetailResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing candidates array", () => {
    const { candidates: _, ...rest } = validDetail;
    expect(transferDetailResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing invoices array", () => {
    const { invoices: _, ...rest } = validDetail;
    expect(transferDetailResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing metrics array", () => {
    const { metrics: _, ...rest } = validDetail;
    expect(transferDetailResultSchema.safeParse(rest).success).toBe(false);
  });

  it("accepts string value on metric", () => {
    expect(
      transferDetailResultSchema.safeParse({
        ...validDetail,
        metrics: [{ ...validMetric, value: "99.9%" }],
      }).success,
    ).toBe(true);
  });

  it("accepts metric with empty note", () => {
    expect(
      transferDetailResultSchema.safeParse({
        ...validDetail,
        metrics: [{ ...validMetric, note: "" }],
      }).success,
    ).toBe(true);
  });

  it("accepts candidate with null name", () => {
    expect(
      transferDetailResultSchema.safeParse({
        ...validDetail,
        candidates: [{ ...validCandidate, candidateName: null }],
      }).success,
    ).toBe(true);
  });

  it("accepts candidate with null hours", () => {
    expect(
      transferDetailResultSchema.safeParse({
        ...validDetail,
        candidates: [{ ...validCandidate, hours: null }],
      }).success,
    ).toBe(true);
  });

  it("accepts invoice with null date and status", () => {
    expect(
      transferDetailResultSchema.safeParse({
        ...validDetail,
        invoices: [{ invoiceId: 101, invoiceDate: null, invoiceStatus: null }],
      }).success,
    ).toBe(true);
  });

  it("rejects non-integer tcId", () => {
    expect(
      transferDetailResultSchema.safeParse({
        ...validDetail,
        candidates: [{ ...validCandidate, tcId: 1.5 }],
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// transferActionResponseSchema
// ---------------------------------------------------------------------------
describe("transferActionResponseSchema", () => {
  it("accepts successful response", () => {
    expect(transferActionResponseSchema.safeParse({ success: true }).success).toBe(true);
  });

  it("accepts failed response with error", () => {
    expect(
      transferActionResponseSchema.safeParse({ success: false, error: "Transfer not found" }).success,
    ).toBe(true);
  });

  it("accepts failed response without error", () => {
    expect(transferActionResponseSchema.safeParse({ success: false }).success).toBe(true);
  });

  it("rejects missing success", () => {
    expect(transferActionResponseSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-boolean success", () => {
    expect(transferActionResponseSchema.safeParse({ success: "yes" }).success).toBe(false);
  });

  it("rejects non-string error", () => {
    expect(transferActionResponseSchema.safeParse({ success: false, error: 123 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// adminTransferDetailResultSchema
// ---------------------------------------------------------------------------
describe("adminTransferDetailResultSchema", () => {
  const validAdminTransfer = {
    transfer_id: 42,
    total: "1500.00",
    company_total: "1800.00",
    transfer_cost: "300.00",
    transfer_status: 1,
    currency_code: "KWD",
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-06-30"),
    payment_received_on: new Date("2026-07-01"),
    transfer_created_at: new Date("2026-06-14"),
    transfer_updated_at: new Date("2026-06-15"),
    company: {
      company_name: "Acme Corp",
      company_email: "billing@acme.com",
    },
    staff_transfer_transfer_created_byTostaff: { staff_name: "Alice" },
    staff_transfer_transfer_updated_byTostaff: { staff_name: "Bob" },
  };

  const validAdminCandidate = {
    id: 1,
    title: "John Doe",
    subtitle: "Software Engineer",
    meta: "40h",
  };

  const validAdminInvoice = {
    id: 101,
    title: "INV-001",
    subtitle: "June 2026",
    meta: "paid",
  };

  const validAdminMetric = {
    label: "Total",
    value: "1500.00",
    note: "",
  };

  const validAdminDetail = {
    transfer: validAdminTransfer,
    candidates: [validAdminCandidate],
    invoices: [validAdminInvoice],
    metrics: [validAdminMetric],
    fileEntries: [],
  };

  it("accepts a valid admin transfer detail", () => {
    expect(adminTransferDetailResultSchema.safeParse(validAdminDetail).success).toBe(true);
  });

  it("accepts null transfer", () => {
    expect(
      adminTransferDetailResultSchema.safeParse({ ...validAdminDetail, transfer: null }).success,
    ).toBe(true);
  });

  it("accepts null company info", () => {
    expect(
      adminTransferDetailResultSchema.safeParse({
        ...validAdminDetail,
        transfer: { ...validAdminTransfer, company: null },
      }).success,
    ).toBe(true);
  });

  it("accepts null staff fields", () => {
    expect(
      adminTransferDetailResultSchema.safeParse({
        ...validAdminDetail,
        transfer: {
          ...validAdminTransfer,
          staff_transfer_transfer_created_byTostaff: null,
          staff_transfer_transfer_updated_byTostaff: null,
        },
      }).success,
    ).toBe(true);
  });

  it("accepts empty arrays", () => {
    expect(
      adminTransferDetailResultSchema.safeParse({
        ...validAdminDetail,
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

  it("rejects missing invoices", () => {
    const { invoices: _, ...rest } = validAdminDetail;
    expect(adminTransferDetailResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing metrics", () => {
    const { metrics: _, ...rest } = validAdminDetail;
    expect(adminTransferDetailResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing fileEntries", () => {
    const { fileEntries: _, ...rest } = validAdminDetail;
    expect(adminTransferDetailResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-integer transfer_id", () => {
    expect(
      adminTransferDetailResultSchema.safeParse({
        ...validAdminDetail,
        transfer: { ...validAdminTransfer, transfer_id: 42.5 },
      }).success,
    ).toBe(false);
  });

  it("accepts empty title on candidate (schema uses bare z.string())", () => {
    expect(
      adminTransferDetailResultSchema.safeParse({
        ...validAdminDetail,
        candidates: [{ ...validAdminCandidate, title: "" }],
      }).success,
    ).toBe(true);
  });
});
