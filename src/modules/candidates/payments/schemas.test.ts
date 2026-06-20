import { describe, it, expect } from "vitest";
import {
  listPaymentsSchema,
  getPaymentDetailSchema,
  createPaymentSchema,
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
// Input schemas
// ---------------------------------------------------------------------------

describe("listPaymentsSchema", () => {
  it("accepts empty input (defaults)", () => {
    const r = listPaymentsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts custom pagination", () => {
    const r = listPaymentsSchema.safeParse({ page: 2, limit: 50 });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.limit).toBe(50);
  });

  it("rejects limit over 100", () => {
    expect(listPaymentsSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("coerces string pagination", () => {
    const r = listPaymentsSchema.safeParse({ page: "2", limit: "10" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });
});

describe("getPaymentDetailSchema", () => {
  it("accepts valid tcId", () => {
    expect(getPaymentDetailSchema.safeParse({ tcId: 5 }).success).toBe(true);
  });

  it("rejects missing tcId", () => {
    expect(getPaymentDetailSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero tcId", () => {
    expect(getPaymentDetailSchema.safeParse({ tcId: 0 }).success).toBe(false);
  });

  it("rejects negative tcId", () => {
    expect(getPaymentDetailSchema.safeParse({ tcId: -1 }).success).toBe(false);
  });
});

describe("createPaymentSchema", () => {
  it("accepts valid create input", () => {
    const r = createPaymentSchema.safeParse({
      transferBenefName: "Ahmed Ali",
      transferBenefIban: "KW00BKUW0000000000000000000",
      bankId: 1,
      amount: 500.0,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.transferBenefName).toBe("Ahmed Ali");
  });

  it("accepts optional amount", () => {
    expect(
      createPaymentSchema.safeParse({
        transferBenefName: "Ahmed",
        transferBenefIban: "KW00BKUW0000000000000000000",
        bankId: 1,
      }).success,
    ).toBe(true);
  });

  it("rejects empty beneficiary name", () => {
    expect(
      createPaymentSchema.safeParse({
        transferBenefName: "",
        transferBenefIban: "KW00BKUW0000000000000000000",
        bankId: 1,
      }).success,
    ).toBe(false);
  });

  it("rejects missing IBAN", () => {
    expect(
      createPaymentSchema.safeParse({ transferBenefName: "Ahmed", bankId: 1 }).success,
    ).toBe(false);
  });

  it("rejects missing bankId", () => {
    expect(
      createPaymentSchema.safeParse({
        transferBenefName: "Ahmed",
        transferBenefIban: "KW00BKUW0000000000000000000",
      }).success,
    ).toBe(false);
  });

  it("rejects non-positive bankId", () => {
    expect(
      createPaymentSchema.safeParse({
        transferBenefName: "Ahmed",
        transferBenefIban: "KW00BKUW0000000000000000000",
        bankId: -1,
      }).success,
    ).toBe(false);
  });

  it("rejects negative amount", () => {
    expect(
      createPaymentSchema.safeParse({
        transferBenefName: "Ahmed",
        transferBenefIban: "KW00BKUW0000000000000000000",
        bankId: 1,
        amount: -100,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

describe("paymentRowSchema", () => {
  const valid = {
    id: 1,
    transferId: null,
    company: "GCC Energies",
    period: "January 2024",
    hours: "120",
    candidateTotal: "480.00",
    companyTotal: "600.00",
    cost: "120.00",
    paid: "0",
    paymentDate: "2024-02-01",
    updated: "2024-01-31",
  };

  it("accepts a valid payment row", () => {
    expect(paymentRowSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = valid;
    expect(paymentRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing company", () => {
    const { company: _, ...rest } = valid;
    expect(paymentRowSchema.safeParse(rest).success).toBe(false);
  });
});

describe("listPaymentsResultSchema", () => {
  it("accepts valid result with empty list", () => {
    expect(
      listPaymentsResultSchema.safeParse({
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    expect(
      listPaymentsResultSchema.safeParse({ total: 0, page: 1, limit: 20, totalPages: 0 }).success,
    ).toBe(false);
  });
});

describe("paymentDetailTransferSchema", () => {
  it("accepts valid transfer", () => {
    const r = paymentDetailTransferSchema.safeParse({
      id: 1,
      period: "January 2024",
      paymentReceived: "yes",
    });
    expect(r.success).toBe(true);
  });

  it("accepts nullable id", () => {
    expect(
      paymentDetailTransferSchema.safeParse({
        id: null,
        period: "January",
        paymentReceived: "no",
      }).success,
    ).toBe(true);
  });
});

describe("paymentDetailSchema", () => {
  const valid = {
    id: 1,
    transferId: null,
    company: "GCC Energies",
    store: "Main Branch",
    hours: "120",
    hourlyRate: "4.000",
    candidateTotal: "480.00",
    companyTotal: "600.00",
    cost: "120.00",
    bonus: "0",
    paid: "0",
    beneficiary: "Ahmed Ali",
    iban: "KW00...",
    bank: "NBK",
    created: "2024-01-01",
    updated: "2024-01-31",
  };

  it("accepts a valid payment detail", () => {
    expect(paymentDetailSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable fields", () => {
    expect(
      paymentDetailSchema.safeParse({
        ...valid,
        transferId: null,
        store: null,
        beneficiary: null,
        iban: null,
        bank: null,
      }).success,
    ).toBe(true);
  });
});

describe("paymentDetailInvoiceSchema", () => {
  it("accepts valid invoice", () => {
    const r = paymentDetailInvoiceSchema.safeParse({
      id: 1,
      date: new Date("2024-01-15"),
      status: "paid",
    });
    expect(r.success).toBe(true);
  });

  it("accepts nullable date and status", () => {
    expect(
      paymentDetailInvoiceSchema.safeParse({ id: 1, date: null, status: null }).success,
    ).toBe(true);
  });
});

describe("getPaymentDetailResultSchema", () => {
  const valid = {
    transferCandidate: {
      id: 1,
      transferId: null,
      company: "GCC Energies",
      store: null,
      hours: "120",
      hourlyRate: "4.000",
      candidateTotal: "480.00",
      companyTotal: "600.00",
      cost: "120.00",
      bonus: "0",
      paid: "0",
      beneficiary: null,
      iban: null,
      bank: null,
      created: "2024-01-01",
      updated: "2024-01-31",
    },
    transfer: null,
    invoices: [],
  };

  it("accepts valid result", () => {
    expect(getPaymentDetailResultSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing transferCandidate", () => {
    expect(
      getPaymentDetailResultSchema.safeParse({ transfer: null, invoices: [] }).success,
    ).toBe(false);
  });
});

describe("paymentMethodSchema", () => {
  it("accepts valid method", () => {
    const r = paymentMethodSchema.safeParse({
      bankId: 1,
      bankName: "NBK",
      bankAccountName: "Ahmed Ali",
      iban: "KW00...",
    });
    expect(r.success).toBe(true);
  });

  it("accepts all nullable fields", () => {
    expect(
      paymentMethodSchema.safeParse({
        bankId: null,
        bankName: null,
        bankAccountName: null,
        iban: null,
      }).success,
    ).toBe(true);
  });
});

describe("createPaymentResultSchema", () => {
  it("accepts valid result", () => {
    expect(createPaymentResultSchema.safeParse({ tcId: 5 }).success).toBe(true);
  });

  it("rejects missing tcId", () => {
    expect(createPaymentResultSchema.safeParse({}).success).toBe(false);
  });
});
