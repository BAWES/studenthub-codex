import { describe, it, expect } from "vitest";
import {
  listPaymentsSchema,
  getPaymentDetailSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listPaymentsSchema
// ---------------------------------------------------------------------------

describe("listPaymentsSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const result = listPaymentsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const result = listPaymentsSchema.safeParse({ page: 2, limit: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("rejects limit over 100", () => {
    const result = listPaymentsSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listPaymentsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects zero page (must be positive)", () => {
    const result = listPaymentsSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getPaymentDetailSchema
// ---------------------------------------------------------------------------

describe("getPaymentDetailSchema", () => {
  it("accepts a valid tcId string", () => {
    const result = getPaymentDetailSchema.safeParse({ tcId: "42" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tcId).toBe(42);
    }
  });

  it("accepts a valid numeric tcId", () => {
    const result = getPaymentDetailSchema.safeParse({ tcId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tcId).toBe(42);
    }
  });

  it("rejects negative tcId", () => {
    const result = getPaymentDetailSchema.safeParse({ tcId: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects zero tcId", () => {
    const result = getPaymentDetailSchema.safeParse({ tcId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects missing tcId", () => {
    const result = getPaymentDetailSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric tcId", () => {
    const result = getPaymentDetailSchema.safeParse({ tcId: "abc" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests (compile-time documentation)
// ---------------------------------------------------------------------------

type PaymentRow = {
  id: number;
  transferId: number | null;
  company: string;
  period: string;
  hours: string;
  candidateTotal: string;
  companyTotal: string;
  cost: string;
  paid: string;
  paymentDate: string;
  updated: string;
};

type ListPaymentsResult = {
  items: PaymentRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type PaymentDetailTransfer = {
  id: number | null;
  period: string;
  paymentReceived: string;
};

type PaymentDetail = {
  id: number;
  transferId: number | null;
  company: string;
  store: string | null;
  hours: string;
  hourlyRate: string;
  candidateTotal: string;
  companyTotal: string;
  cost: string;
  bonus: string;
  paid: string;
  beneficiary: string | null;
  iban: string | null;
  bank: string | null;
  created: string;
  updated: string;
};

type GetPaymentDetailResult = {
  transferCandidate: PaymentDetail;
  transfer: PaymentDetailTransfer | null;
  invoices: { id: number; date: Date | null; status: string | null }[];
};

describe("PaymentRow shape", () => {
  it("defines the expected fields", () => {
    const mock: PaymentRow = {
      id: 1,
      transferId: 10,
      company: "Acme Corp",
      period: "Jun 2026 to Jul 2026",
      hours: "40h 0m",
      candidateTotal: "500 KWD",
      companyTotal: "1,000 KWD",
      cost: "5 KWD",
      paid: "Unpaid",
      paymentDate: "Not received",
      updated: "2026-06-09",
    };
    expect(mock.id).toBe(1);
    expect(mock.company).toBe("Acme Corp");
    expect(mock.paid).toBe("Unpaid");
  });
});

describe("ListPaymentsResult shape", () => {
  it("accepts a valid result set", () => {
    const result: ListPaymentsResult = {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.total).toBe(0);
    expect(result.items).toHaveLength(0);
  });
});

describe("GetPaymentDetailResult shape", () => {
  it("accepts a valid detail result with transfer", () => {
    const result: GetPaymentDetailResult = {
      transferCandidate: {
        id: 1,
        transferId: 10,
        company: "Acme Corp",
        store: "Store 1",
        hours: "40h 0m",
        hourlyRate: "5.000 KWD",
        candidateTotal: "500 KWD",
        companyTotal: "1,000 KWD",
        cost: "5 KWD",
        bonus: "0 KWD",
        paid: "Unpaid",
        beneficiary: "John Doe",
        iban: "KW123456789",
        bank: "NBK",
        created: "2026-06-01",
        updated: "2026-06-09",
      },
      transfer: {
        id: 10,
        period: "Jun 2026 to Jul 2026",
        paymentReceived: "Not received",
      },
      invoices: [
        { id: 1, date: new Date("2026-06-30"), status: "paid" },
      ],
    };
    expect(result.transferCandidate.id).toBe(1);
    expect(result.transfer?.period).toBe("Jun 2026 to Jul 2026");
    expect(result.invoices).toHaveLength(1);
  });

  it("accepts a detail result without transfer", () => {
    const result: GetPaymentDetailResult = {
      transferCandidate: {
        id: 2,
        transferId: null,
        company: "Store Only",
        store: "Shop 5",
        hours: "20h 0m",
        hourlyRate: "0 KWD",
        candidateTotal: "200 KWD",
        companyTotal: "400 KWD",
        cost: "2 KWD",
        bonus: "0 KWD",
        paid: "Paid",
        beneficiary: null,
        iban: null,
        bank: null,
        created: "2026-06-05",
        updated: "2026-06-07",
      },
      transfer: null,
      invoices: [],
    };
    expect(result.transferCandidate.id).toBe(2);
    expect(result.transfer).toBeNull();
    expect(result.invoices).toHaveLength(0);
  });
});
