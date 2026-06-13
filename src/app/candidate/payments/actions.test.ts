import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listPaymentsSchema,
  getPaymentDetailSchema,
  createPaymentSchema,
} from "./schemas";
import type { PaymentMethod } from "./schemas";

// ---------------------------------------------------------------------------
// Mocks — delegate to module actions (these now contain the real logic)
// ---------------------------------------------------------------------------

const mockModuleListPaymentsAction = vi.fn();
const mockModuleGetPaymentDetailAction = vi.fn();
const mockModuleCreatePaymentAction = vi.fn();
const mockModuleGetPaymentMethodsAction = vi.fn();

vi.mock("@/modules/candidates/payments/actions", () => ({
  listCandidatePaymentsAction: mockModuleListPaymentsAction,
  getCandidatePaymentDetailAction: mockModuleGetPaymentDetailAction,
  createCandidatePaymentAction: mockModuleCreatePaymentAction,
  getPaymentMethodsAction: mockModuleGetPaymentMethodsAction,
  // Prisma-level functions (called internally by route-level wrappers)
  listCandidatePayments: vi.fn(),
  getCandidatePaymentDetail: vi.fn(),
  createCandidatePayment: vi.fn(),
  getPaymentMethods: vi.fn(),
}));

vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn(),
}));

// Must import after mocks are set up
const { requireCapability } = await import("@/modules/auth/session");
const {
  listCandidatePayments,
  getCandidatePaymentDetail,
  createCandidatePayment,
  getPaymentMethods,
} = await import("./actions");

const mockUser = { id: 1, role: "candidate" };

// ---------------------------------------------------------------------------
// Schema tests (pure — no mock dependency)
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
// Action tests — verify delegation to module
// ---------------------------------------------------------------------------

describe("listCandidatePayments (delegation)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls module listCandidatePaymentsAction with params", async () => {
    const expected = { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
    mockModuleListPaymentsAction.mockResolvedValue(expected);

    const result = await listCandidatePayments({ page: 1, limit: 20 });

    expect(mockModuleListPaymentsAction).toHaveBeenCalled();
    expect(result).toEqual(expected);
  });

  it("returns empty result on validation failure", async () => {
    const result = await listCandidatePayments({ limit: 999 });
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });
});

describe("getCandidatePaymentDetail (delegation)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls module getCandidatePaymentDetailAction with tcId", async () => {
    mockModuleGetPaymentDetailAction.mockResolvedValue(null);

    const result = await getCandidatePaymentDetail({ tcId: 42 });

    expect(mockModuleGetPaymentDetailAction).toHaveBeenCalled();
  });
});

describe("createCandidatePayment (delegation)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls module createCandidatePaymentAction with data", async () => {
    mockModuleCreatePaymentAction.mockResolvedValue({ tcId: 42 });

    const result = await createCandidatePayment({
      transferBenefName: "John Doe",
      transferBenefIban: "KW1234567890",
      bankId: 1,
    });

    expect(mockModuleCreatePaymentAction).toHaveBeenCalled();
    expect(result.tcId).toBe(42);
  });
});

describe("getPaymentMethods (delegation)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls module getPaymentMethodsAction", async () => {
    mockModuleGetPaymentMethodsAction.mockResolvedValue([]);

    const result = await getPaymentMethods();

    expect(mockModuleGetPaymentMethodsAction).toHaveBeenCalled();
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Shape/documentation tests (unchanged)
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

describe("createPaymentSchema", () => {
  it("accepts valid beneficiary params", () => {
    const result = createPaymentSchema.safeParse({
      transferBenefName: "John Doe",
      transferBenefIban: "KW1234567890123456789012345678901234567890",
      bankId: 1,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.transferBenefName).toBe("John Doe");
      expect(result.data.transferBenefIban).toBe("KW1234567890123456789012345678901234567890");
      expect(result.data.bankId).toBe(1);
    }
  });

  it("accepts with optional amount", () => {
    const result = createPaymentSchema.safeParse({
      transferBenefName: "Jane Doe",
      transferBenefIban: "KW1234567890",
      bankId: 2,
      amount: 500.0,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amount).toBe(500.0);
    }
  });

  it("rejects empty beneficiary name", () => {
    const result = createPaymentSchema.safeParse({
      transferBenefName: "",
      transferBenefIban: "KW1234567890",
      bankId: 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing bankId", () => {
    const result = createPaymentSchema.safeParse({
      transferBenefName: "John Doe",
      transferBenefIban: "KW1234567890",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing IBAN", () => {
    const result = createPaymentSchema.safeParse({
      transferBenefName: "John Doe",
      bankId: 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero bankId", () => {
    const result = createPaymentSchema.safeParse({
      transferBenefName: "John Doe",
      transferBenefIban: "KW1234567890",
      bankId: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative amount", () => {
    const result = createPaymentSchema.safeParse({
      transferBenefName: "John Doe",
      transferBenefIban: "KW1234567890",
      bankId: 1,
      amount: -100,
    });
    expect(result.success).toBe(false);
  });
});

describe("PaymentMethod shape", () => {
  it("defines the expected fields", () => {
    const mock: PaymentMethod = {
      bankId: 1,
      bankName: "National Bank of Kuwait",
      bankAccountName: "John Doe",
      iban: "KW1234567890",
    };
    expect(mock.bankId).toBe(1);
    expect(mock.bankName).toBe("National Bank of Kuwait");
    expect(mock.iban).toBe("KW1234567890");
  });

  it("accepts null fields", () => {
    const mock: PaymentMethod = {
      bankId: null,
      bankName: null,
      bankAccountName: null,
      iban: null,
    };
    expect(mock.bankId).toBeNull();
  });
});
