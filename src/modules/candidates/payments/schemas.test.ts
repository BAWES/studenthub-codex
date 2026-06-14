import { describe, it, expect } from "vitest";
import {
  paymentRowSchema,
  listPaymentsResultSchema,
  paymentDetailTransferSchema,
  paymentDetailSchema,
  getPaymentDetailResultSchema,
  paymentMethodSchema,
  createPaymentResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// paymentRowSchema
// ---------------------------------------------------------------------------

describe("paymentRowSchema", () => {
  const validRow = () => ({
    id: 1,
    transferId: 10,
    company: "Acme Corp",
    period: "June 2026",
    hours: "120",
    candidateTotal: "1200.00",
    companyTotal: "1500.00",
    cost: "300.00",
    paid: "1200.00",
    paymentDate: "2026-07-01",
    updated: "2026-07-01T10:00:00Z",
  });

  it("accepts a valid payment row", () => {
    const r = paymentRowSchema.safeParse(validRow());
    expect(r.success).toBe(true);
  });

  it("accepts nullable transferId", () => {
    const r = paymentRowSchema.safeParse({ ...validRow(), transferId: null });
    expect(r.success).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = validRow();
    expect(paymentRowSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listPaymentsResultSchema
// ---------------------------------------------------------------------------

describe("listPaymentsResultSchema", () => {
  it("accepts a valid paginated result", () => {
    const r = listPaymentsResultSchema.safeParse({
      items: [{
        id: 1, transferId: null, company: "Acme", period: "June",
        hours: "40", candidateTotal: "400", companyTotal: "500",
        cost: "100", paid: "400", paymentDate: "2026-07-01", updated: "",
      }],
      total: 1, page: 1, limit: 20, totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty items", () => {
    const r = listPaymentsResultSchema.safeParse({
      items: [], total: 0, page: 1, limit: 20, totalPages: 0,
    });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// paymentDetailTransferSchema
// ---------------------------------------------------------------------------

describe("paymentDetailTransferSchema", () => {
  it("accepts valid transfer data", () => {
    const r = paymentDetailTransferSchema.safeParse({ id: 5, period: "June", paymentReceived: "Yes" });
    expect(r.success).toBe(true);
  });

  it("accepts nullable id", () => {
    const r = paymentDetailTransferSchema.safeParse({ id: null, period: "", paymentReceived: "" });
    expect(r.success).toBe(true);
  });

  it("rejects missing period", () => {
    const r = paymentDetailTransferSchema.safeParse({ id: null, paymentReceived: "" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// paymentDetailSchema
// ---------------------------------------------------------------------------

describe("paymentDetailSchema", () => {
  const validDetail = () => ({
    id: 1, transferId: 10,
    company: "Acme", store: "Main Branch",
    hours: "120", hourlyRate: "10.00",
    candidateTotal: "1200.00", companyTotal: "1500.00",
    cost: "300.00", bonus: "0.00", paid: "1200.00",
    beneficiary: "John Doe", iban: "KW123...", bank: "NBK",
    created: "2026-01-01T00:00:00Z", updated: "2026-07-01T00:00:00Z",
  });

  it("accepts valid payment detail", () => {
    const r = paymentDetailSchema.safeParse(validDetail());
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields", () => {
    const r = paymentDetailSchema.safeParse({
      ...validDetail(),
      transferId: null, store: null,
      beneficiary: null, iban: null, bank: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing company", () => {
    const { company: _, ...rest } = validDetail();
    expect(paymentDetailSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getPaymentDetailResultSchema
// ---------------------------------------------------------------------------

describe("getPaymentDetailResultSchema", () => {
  it("accepts valid result with invoices", () => {
    const r = getPaymentDetailResultSchema.safeParse({
      transferCandidate: {
        id: 1, transferId: null, company: "Acme", store: null,
        hours: "40", hourlyRate: "10", candidateTotal: "400",
        companyTotal: "500", cost: "100", bonus: "0", paid: "400",
        beneficiary: null, iban: null, bank: null,
        created: "", updated: "",
      },
      transfer: null,
      invoices: [{ id: 1, date: null, status: null }],
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing transferCandidate", () => {
    const r = getPaymentDetailResultSchema.safeParse({
      transfer: null, invoices: [],
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// paymentMethodSchema
// ---------------------------------------------------------------------------

describe("paymentMethodSchema", () => {
  it("accepts valid payment method", () => {
    const r = paymentMethodSchema.safeParse({
      bankId: 1, bankName: "NBK", bankAccountName: "John", iban: "KW12",
    });
    expect(r.success).toBe(true);
  });

  it("accepts all-null fields", () => {
    const r = paymentMethodSchema.safeParse({
      bankId: null, bankName: null, bankAccountName: null, iban: null,
    });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// createPaymentResultSchema
// ---------------------------------------------------------------------------

describe("createPaymentResultSchema", () => {
  it("accepts valid result", () => {
    const r = createPaymentResultSchema.safeParse({ tcId: 42 });
    expect(r.success).toBe(true);
  });

  it("rejects missing tcId", () => {
    const r = createPaymentResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});
