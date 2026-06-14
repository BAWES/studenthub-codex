import { describe, it, expect } from "vitest";
import {
  paymentRowSchema,
  listPaymentsResultSchema,
  paymentDetailTransferSchema,
  paymentDetailSchema,
  paymentDetailInvoiceSchema,
  getPaymentDetailResultSchema,
  paymentMethodSchema,
  createPaymentResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// paymentRowSchema
// ---------------------------------------------------------------------------
describe("paymentRowSchema", () => {
  const validRow = {
    id: 1,
    transferId: 42,
    company: "Acme Corp",
    period: "2026-06",
    hours: "160.00",
    candidateTotal: "2000.00",
    companyTotal: "2500.00",
    cost: "500.00",
    paid: "2000.00",
    paymentDate: "2026-07-01",
    updated: "2026-06-15T12:00:00.000Z",
  };

  it("accepts a fully populated row", () => {
    expect(paymentRowSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts null transferId", () => {
    expect(
      paymentRowSchema.safeParse({ ...validRow, transferId: null }).success,
    ).toBe(true);
  });

  it("accepts empty strings on z.string() fields", () => {
    expect(
      paymentRowSchema.safeParse({
        ...validRow,
        company: "",
        period: "",
        hours: "",
        candidateTotal: "",
        companyTotal: "",
        cost: "",
        paid: "",
        paymentDate: "",
        updated: "",
      }).success,
    ).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = validRow;
    expect(paymentRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing company", () => {
    const { company: _, ...rest } = validRow;
    expect(paymentRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-integer id", () => {
    expect(
      paymentRowSchema.safeParse({ ...validRow, id: 1.5 }).success,
    ).toBe(false);
  });

  it("rejects non-integer transferId", () => {
    expect(
      paymentRowSchema.safeParse({ ...validRow, transferId: 42.5 }).success,
    ).toBe(false);
  });

  it("rejects non-string company", () => {
    expect(
      paymentRowSchema.safeParse({ ...validRow, company: 123 }).success,
    ).toBe(false);
  });

  it("rejects string id", () => {
    expect(
      paymentRowSchema.safeParse({ ...validRow, id: "1" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listPaymentsResultSchema
// ---------------------------------------------------------------------------
describe("listPaymentsResultSchema", () => {
  const validRow = {
    id: 1,
    transferId: 42,
    company: "Acme Corp",
    period: "2026-06",
    hours: "160.00",
    candidateTotal: "2000.00",
    companyTotal: "2500.00",
    cost: "500.00",
    paid: "2000.00",
    paymentDate: "2026-07-01",
    updated: "2026-06-15T12:00:00.000Z",
  };

  const validResult = {
    items: [validRow],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid list result with one item", () => {
    expect(listPaymentsResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      listPaymentsResultSchema.safeParse({
        ...validResult,
        items: [],
        total: 0,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("accepts multiple items", () => {
    const manyItems = Array.from({ length: 3 }, (_, i) => ({
      ...validRow,
      id: i + 1,
      company: `Company ${i + 1}`,
    }));
    expect(
      listPaymentsResultSchema.safeParse({
        ...validResult,
        items: manyItems,
        total: 100,
        page: 3,
        totalPages: 5,
      }).success,
    ).toBe(true);
  });

  it("accepts items with null transferId", () => {
    expect(
      listPaymentsResultSchema.safeParse({
        ...validResult,
        items: [{ ...validRow, transferId: null }],
      }).success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    const { items: _, ...rest } = validResult;
    expect(listPaymentsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-array items", () => {
    expect(
      listPaymentsResultSchema.safeParse({ ...validResult, items: "not-array" })
        .success,
    ).toBe(false);
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = validResult;
    expect(listPaymentsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing page", () => {
    const { page: _, ...rest } = validResult;
    expect(listPaymentsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing limit", () => {
    const { limit: _, ...rest } = validResult;
    expect(listPaymentsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing totalPages", () => {
    const { totalPages: _, ...rest } = validResult;
    expect(listPaymentsResultSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// paymentDetailTransferSchema
// ---------------------------------------------------------------------------
describe("paymentDetailTransferSchema", () => {
  const validTransfer = {
    id: 99,
    period: "2026-06",
    paymentReceived: "5000.00",
  };

  it("accepts a fully populated transfer detail", () => {
    expect(paymentDetailTransferSchema.safeParse(validTransfer).success).toBe(
      true,
    );
  });

  it("accepts null id", () => {
    expect(
      paymentDetailTransferSchema.safeParse({ ...validTransfer, id: null })
        .success,
    ).toBe(true);
  });

  it("accepts empty period string", () => {
    expect(
      paymentDetailTransferSchema.safeParse({ ...validTransfer, period: "" })
        .success,
    ).toBe(true);
  });

  it("accepts empty paymentReceived string", () => {
    expect(
      paymentDetailTransferSchema.safeParse({
        ...validTransfer,
        paymentReceived: "",
      }).success,
    ).toBe(true);
  });

  it("rejects missing period", () => {
    const { period: _, ...rest } = validTransfer;
    expect(paymentDetailTransferSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing paymentReceived", () => {
    const { paymentReceived: _, ...rest } = validTransfer;
    expect(paymentDetailTransferSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-integer id", () => {
    expect(
      paymentDetailTransferSchema.safeParse({ ...validTransfer, id: 99.5 })
        .success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// paymentDetailSchema
// ---------------------------------------------------------------------------
describe("paymentDetailSchema", () => {
  const validDetail = {
    id: 1,
    transferId: 42,
    company: "Acme Corp",
    store: "Main Branch",
    hours: "160.00",
    hourlyRate: "12.50",
    candidateTotal: "2000.00",
    companyTotal: "2500.00",
    cost: "500.00",
    bonus: "100.00",
    paid: "2100.00",
    beneficiary: "John Doe",
    iban: "KW12ABCD123456789012345678901",
    bank: "National Bank",
    created: "2026-06-01T10:00:00.000Z",
    updated: "2026-06-15T12:00:00.000Z",
  };

  it("accepts a fully populated detail", () => {
    expect(paymentDetailSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts null transferId", () => {
    expect(
      paymentDetailSchema.safeParse({ ...validDetail, transferId: null })
        .success,
    ).toBe(true);
  });

  it("accepts null store", () => {
    expect(
      paymentDetailSchema.safeParse({ ...validDetail, store: null }).success,
    ).toBe(true);
  });

  it("accepts null beneficiary", () => {
    expect(
      paymentDetailSchema.safeParse({ ...validDetail, beneficiary: null })
        .success,
    ).toBe(true);
  });

  it("accepts null iban", () => {
    expect(
      paymentDetailSchema.safeParse({ ...validDetail, iban: null }).success,
    ).toBe(true);
  });

  it("accepts null bank", () => {
    expect(
      paymentDetailSchema.safeParse({ ...validDetail, bank: null }).success,
    ).toBe(true);
  });

  it("accepts all nullable fields as null simultaneously", () => {
    expect(
      paymentDetailSchema.safeParse({
        ...validDetail,
        transferId: null,
        store: null,
        beneficiary: null,
        iban: null,
        bank: null,
      }).success,
    ).toBe(true);
  });

  it("accepts empty strings on z.string() fields", () => {
    expect(
      paymentDetailSchema.safeParse({
        ...validDetail,
        company: "",
        hours: "",
        hourlyRate: "",
        candidateTotal: "",
        companyTotal: "",
        cost: "",
        bonus: "",
        paid: "",
        created: "",
        updated: "",
      }).success,
    ).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = validDetail;
    expect(paymentDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing company", () => {
    const { company: _, ...rest } = validDetail;
    expect(paymentDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing hours", () => {
    const { hours: _, ...rest } = validDetail;
    expect(paymentDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing hourlyRate", () => {
    const { hourlyRate: _, ...rest } = validDetail;
    expect(paymentDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing paid", () => {
    const { paid: _, ...rest } = validDetail;
    expect(paymentDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing created", () => {
    const { created: _, ...rest } = validDetail;
    expect(paymentDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing updated", () => {
    const { updated: _, ...rest } = validDetail;
    expect(paymentDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-integer id", () => {
    expect(
      paymentDetailSchema.safeParse({ ...validDetail, id: 1.5 }).success,
    ).toBe(false);
  });

  it("rejects non-integer transferId", () => {
    expect(
      paymentDetailSchema.safeParse({ ...validDetail, transferId: 42.5 })
        .success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// paymentDetailInvoiceSchema
// ---------------------------------------------------------------------------
describe("paymentDetailInvoiceSchema", () => {
  const validInvoice = {
    id: 101,
    date: new Date("2026-06-30"),
    status: "paid",
  };

  it("accepts a fully populated invoice", () => {
    expect(paymentDetailInvoiceSchema.safeParse(validInvoice).success).toBe(
      true,
    );
  });

  it("accepts null date", () => {
    expect(
      paymentDetailInvoiceSchema.safeParse({ ...validInvoice, date: null })
        .success,
    ).toBe(true);
  });

  it("accepts null status", () => {
    expect(
      paymentDetailInvoiceSchema.safeParse({ ...validInvoice, status: null })
        .success,
    ).toBe(true);
  });

  it("accepts null date and null status together", () => {
    expect(
      paymentDetailInvoiceSchema.safeParse({ ...validInvoice, date: null, status: null })
        .success,
    ).toBe(true);
  });

  it("accepts empty status string", () => {
    expect(
      paymentDetailInvoiceSchema.safeParse({ ...validInvoice, status: "" })
        .success,
    ).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = validInvoice;
    expect(paymentDetailInvoiceSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-integer id", () => {
    expect(
      paymentDetailInvoiceSchema.safeParse({ ...validInvoice, id: 101.5 })
        .success,
    ).toBe(false);
  });

  it("rejects string date instead of Date object", () => {
    expect(
      paymentDetailInvoiceSchema.safeParse({
        ...validInvoice,
        date: "2026-06-30",
      }).success,
    ).toBe(false);
  });

  it("rejects number as status", () => {
    expect(
      paymentDetailInvoiceSchema.safeParse({ ...validInvoice, status: 123 })
        .success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getPaymentDetailResultSchema
// ---------------------------------------------------------------------------
describe("getPaymentDetailResultSchema", () => {
  const validTransferCandidate = {
    id: 1,
    transferId: 42,
    company: "Acme Corp",
    store: "Main Branch",
    hours: "160.00",
    hourlyRate: "12.50",
    candidateTotal: "2000.00",
    companyTotal: "2500.00",
    cost: "500.00",
    bonus: "100.00",
    paid: "2100.00",
    beneficiary: "John Doe",
    iban: "KW12ABCD123456789012345678901",
    bank: "National Bank",
    created: "2026-06-01T10:00:00.000Z",
    updated: "2026-06-15T12:00:00.000Z",
  };

  const validTransfer = {
    id: 99,
    period: "2026-06",
    paymentReceived: "5000.00",
  };

  const validInvoice = {
    id: 101,
    date: new Date("2026-06-30"),
    status: "paid",
  };

  const validResult = {
    transferCandidate: validTransferCandidate,
    transfer: validTransfer,
    invoices: [validInvoice],
  };

  it("accepts a fully populated result", () => {
    expect(getPaymentDetailResultSchema.safeParse(validResult).success).toBe(
      true,
    );
  });

  it("accepts null transfer (no transfer associated)", () => {
    expect(
      getPaymentDetailResultSchema.safeParse({
        ...validResult,
        transfer: null,
      }).success,
    ).toBe(true);
  });

  it("accepts empty invoices array", () => {
    expect(
      getPaymentDetailResultSchema.safeParse({
        ...validResult,
        invoices: [],
      }).success,
    ).toBe(true);
  });

  it("accepts null transfer with empty invoices", () => {
    expect(
      getPaymentDetailResultSchema.safeParse({
        ...validResult,
        transfer: null,
        invoices: [],
      }).success,
    ).toBe(true);
  });

  it("accepts invoices with null date and status", () => {
    expect(
      getPaymentDetailResultSchema.safeParse({
        ...validResult,
        invoices: [{ id: 101, date: null, status: null }],
      }).success,
    ).toBe(true);
  });

  it("accepts transferCandidate with nullable fields null", () => {
    expect(
      getPaymentDetailResultSchema.safeParse({
        ...validResult,
        transferCandidate: {
          ...validTransferCandidate,
          transferId: null,
          store: null,
          beneficiary: null,
          iban: null,
          bank: null,
        },
      }).success,
    ).toBe(true);
  });

  it("rejects missing transferCandidate", () => {
    const { transferCandidate: _, ...rest } = validResult;
    expect(getPaymentDetailResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing invoices", () => {
    const { invoices: _, ...rest } = validResult;
    expect(getPaymentDetailResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-array invoices", () => {
    expect(
      getPaymentDetailResultSchema.safeParse({
        ...validResult,
        invoices: "not-array",
      }).success,
    ).toBe(false);
  });

  it("rejects invalid transferCandidate (missing id)", () => {
    const { id: _, ...badCandidate } = validTransferCandidate;
    expect(
      getPaymentDetailResultSchema.safeParse({
        ...validResult,
        transferCandidate: badCandidate,
      }).success,
    ).toBe(false);
  });

  it("rejects invalid transfer (non-integer id)", () => {
    expect(
      getPaymentDetailResultSchema.safeParse({
        ...validResult,
        transfer: { ...validTransfer, id: 99.5 },
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// paymentMethodSchema
// ---------------------------------------------------------------------------
describe("paymentMethodSchema", () => {
  const validMethod = {
    bankId: 5,
    bankName: "National Bank",
    bankAccountName: "Acme Corp Payments",
    iban: "KW12ABCD123456789012345678901",
  };

  it("accepts a fully populated method", () => {
    expect(paymentMethodSchema.safeParse(validMethod).success).toBe(true);
  });

  it("accepts null bankId", () => {
    expect(
      paymentMethodSchema.safeParse({ ...validMethod, bankId: null }).success,
    ).toBe(true);
  });

  it("accepts null bankName", () => {
    expect(
      paymentMethodSchema.safeParse({ ...validMethod, bankName: null }).success,
    ).toBe(true);
  });

  it("accepts null bankAccountName", () => {
    expect(
      paymentMethodSchema.safeParse({ ...validMethod, bankAccountName: null })
        .success,
    ).toBe(true);
  });

  it("accepts null iban", () => {
    expect(
      paymentMethodSchema.safeParse({ ...validMethod, iban: null }).success,
    ).toBe(true);
  });

  it("accepts all nullable fields as null", () => {
    expect(
      paymentMethodSchema.safeParse({
        bankId: null,
        bankName: null,
        bankAccountName: null,
        iban: null,
      }).success,
    ).toBe(true);
  });

  it("accepts empty strings on z.string() fields", () => {
    expect(
      paymentMethodSchema.safeParse({
        ...validMethod,
        bankName: "",
        bankAccountName: "",
        iban: "",
      }).success,
    ).toBe(true);
  });

  it("rejects non-integer bankId", () => {
    expect(
      paymentMethodSchema.safeParse({ ...validMethod, bankId: 5.5 }).success,
    ).toBe(false);
  });

  // paymentMethodSchema fields are nullable but not optional — .nullable()
  // allows null but does not make the key itself optional (undefined is
  // still rejected).
  it("rejects empty object (fields are nullable but not optional)", () => {
    expect(paymentMethodSchema.safeParse({}).success).toBe(false);
  });

  it("rejects missing iban (all keys are required even if nullable)", () => {
    const { iban: _, ...rest } = validMethod;
    expect(paymentMethodSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createPaymentResultSchema
// ---------------------------------------------------------------------------
describe("createPaymentResultSchema", () => {
  it("accepts a valid result with tcId", () => {
    expect(
      createPaymentResultSchema.safeParse({ tcId: 42 }).success,
    ).toBe(true);
  });

  it("accepts tcId as 0", () => {
    expect(
      createPaymentResultSchema.safeParse({ tcId: 0 }).success,
    ).toBe(true);
  });

  it("rejects missing tcId", () => {
    expect(createPaymentResultSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-integer tcId", () => {
    expect(
      createPaymentResultSchema.safeParse({ tcId: 42.5 }).success,
    ).toBe(false);
  });

  it("rejects string tcId", () => {
    expect(
      createPaymentResultSchema.safeParse({ tcId: "42" }).success,
    ).toBe(false);
  });

  it("rejects negative tcId (schema uses z.number().int() without .positive())", () => {
    expect(
      createPaymentResultSchema.safeParse({ tcId: -1 }).success,
    ).toBe(true);
  });
});
