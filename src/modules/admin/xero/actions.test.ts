import { describe, it, expect } from "vitest";
import {
  listBankTransactionsSchema,
  getBankTransactionSchema,
} from "./schemas";

import {
  bankTransactionItemSchema,
  bankTransactionDetailSchema,
  listBankTransactionsResultSchema,
  reconciliationStatusSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listBankTransactionsSchema
// ---------------------------------------------------------------------------

describe("listBankTransactionsSchema", () => {
  it("accepts empty params with defaults", () => {
    const result = listBankTransactionsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.sortBy).toBe("date");
      expect(result.data.sortDir).toBe("desc");
    }
  });

  it("accepts all filter fields", () => {
    const result = listBankTransactionsSchema.safeParse({
      isReconciled: true,
      dateFrom: "2026-01-01",
      dateTo: "2026-06-30",
      contactName: "Acme Corp",
      type: "RECEIVE",
      status: "AUTHORISED",
      reference: "INV-001",
      sortBy: "total",
      sortDir: "asc",
      page: 2,
      limit: 50,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isReconciled).toBe(true);
      expect(result.data.dateFrom).toBe("2026-01-01");
      expect(result.data.sortBy).toBe("total");
      expect(result.data.sortDir).toBe("asc");
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it("rejects invalid date format", () => {
    const result = listBankTransactionsSchema.safeParse({
      dateFrom: "01-01-2026",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid sortBy value", () => {
    const result = listBankTransactionsSchema.safeParse({
      sortBy: "invalid_field",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid sortDir value", () => {
    const result = listBankTransactionsSchema.safeParse({
      sortDir: "random",
    });
    expect(result.success).toBe(false);
  });

  it("rejects limit of 0", () => {
    const result = listBankTransactionsSchema.safeParse({ limit: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects limit above 100", () => {
    const result = listBankTransactionsSchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listBankTransactionsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("coerces string number page to number", () => {
    const result = listBankTransactionsSchema.safeParse({ page: "3" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
    }
  });

  it("coerces string boolean isReconciled to boolean", () => {
    const result = listBankTransactionsSchema.safeParse({
      isReconciled: "true",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isReconciled).toBe(true);
    }
  });

  it("accepts all valid sortBy values", () => {
    const validSortBys = ["date", "total", "created_at", "updated_at"];
    for (const sortBy of validSortBys) {
      const result = listBankTransactionsSchema.safeParse({ sortBy });
      expect(result.success).toBe(true);
    }
  });

  it("rejects page 0", () => {
    const result = listBankTransactionsSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getBankTransactionSchema
// ---------------------------------------------------------------------------

describe("getBankTransactionSchema", () => {
  it("accepts valid bank transaction ID", () => {
    const result = getBankTransactionSchema.safeParse({
      bankTransactionId: "tx-001-abc",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.bankTransactionId).toBe("tx-001-abc");
    }
  });

  it("rejects empty bank transaction ID", () => {
    const result = getBankTransactionSchema.safeParse({
      bankTransactionId: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing bank transaction ID", () => {
    const result = getBankTransactionSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

describe("BankTransactionItem type shape", () => {
  type BankTransactionItem = {
    bankTransactionId: string;
    contactId: string | null;
    contactName: string | null;
    reference: string | null;
    status: string | null;
    type: string | null;
    total: number | null;
    subTotal: number | null;
    totalTax: number | null;
    currencyCode: string | null;
    isReconciled: boolean | null;
    hasAttachments: boolean | null;
    date: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  it("shapes a complete transaction item", () => {
    const item: BankTransactionItem = {
      bankTransactionId: "bt-001",
      contactId: "c-001",
      contactName: "Acme Corp",
      reference: "INV-001",
      status: "AUTHORISED",
      type: "RECEIVE",
      total: 1500.0,
      subTotal: 1400.0,
      totalTax: 100.0,
      currencyCode: "KWD",
      isReconciled: false,
      hasAttachments: true,
      date: new Date("2026-06-01"),
      createdAt: new Date("2026-06-01"),
      updatedAt: new Date("2026-06-02"),
    };
    expect(item.bankTransactionId).toBe("bt-001");
    expect(item.isReconciled).toBe(false);
  });

  it("allows all null fields", () => {
    const item: BankTransactionItem = {
      bankTransactionId: "bt-002",
      contactId: null,
      contactName: null,
      reference: null,
      status: null,
      type: null,
      total: null,
      subTotal: null,
      totalTax: null,
      currencyCode: null,
      isReconciled: null,
      hasAttachments: null,
      date: null,
      createdAt: null,
      updatedAt: null,
    };
    expect(item.bankTransactionId).toBe("bt-002");
    expect(item.contactName).toBeNull();
  });
});

describe("BankTransactionDetail type shape", () => {
  type BankTransactionDetail = {
    bankTransactionId: string;
    contactId: string | null;
    contactName: string | null;
    reference: string | null;
    status: string | null;
    type: string | null;
    total: number | null;
    subTotal: number | null;
    totalTax: number | null;
    currencyCode: string | null;
    currencyRate: number | null;
    isReconciled: boolean | null;
    hasAttachments: boolean | null;
    lineAmountTypes: string | null;
    overpaymentId: string | null;
    prepaymentId: string | null;
    statusAttributeString: string | null;
    url: string | null;
    validationErrors: string | null;
    date: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    lineItems: Array<{
      lineItemId: string;
      description: string | null;
      accountCode: string | null;
      lineAmount: number | null;
      unitAmount: number | null;
      quantity: number | null;
      taxAmount: number | null;
      taxType: string | null;
    }>;
  };

  it("shapes a complete detail object", () => {
    const detail: BankTransactionDetail = {
      bankTransactionId: "bt-001",
      contactId: "c-001",
      contactName: "Acme Corp",
      reference: "INV-001",
      status: "AUTHORISED",
      type: "RECEIVE",
      total: 1500.0,
      subTotal: 1400.0,
      totalTax: 100.0,
      currencyCode: "KWD",
      currencyRate: 1.0,
      isReconciled: false,
      hasAttachments: true,
      lineAmountTypes: "Inclusive",
      overpaymentId: null,
      prepaymentId: null,
      statusAttributeString: "OK",
      url: "https://xero.com/...",
      validationErrors: null,
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      lineItems: [
        {
          lineItemId: "li-001",
          description: "Consulting services",
          accountCode: "200",
          lineAmount: 1400.0,
          unitAmount: 1400.0,
          quantity: 1,
          taxAmount: 100.0,
          taxType: "OUTPUT",
        },
      ],
    };
    expect(detail.lineItems).toHaveLength(1);
    expect(detail.lineItems[0].description).toBe("Consulting services");
  });

  it("allows empty line items array", () => {
    const detail: BankTransactionDetail = {
      bankTransactionId: "bt-002",
      contactId: null,
      contactName: null,
      reference: null,
      status: null,
      type: null,
      total: null,
      subTotal: null,
      totalTax: null,
      currencyCode: null,
      currencyRate: null,
      isReconciled: null,
      hasAttachments: null,
      lineAmountTypes: null,
      overpaymentId: null,
      prepaymentId: null,
      statusAttributeString: null,
      url: null,
      validationErrors: null,
      date: null,
      createdAt: null,
      updatedAt: null,
      lineItems: [],
    };
    expect(detail.lineItems).toEqual([]);
  });
});

describe("ListBankTransactionsResult type shape", () => {
  it("shapes a paginated result", () => {
    const result = {
      transactions: [] as Array<{ bankTransactionId: string }>,
      total: 100,
      page: 1,
      limit: 20,
      totalPages: 5,
    };
    expect(result.totalPages).toBe(5);
    expect(result.total).toBe(100);
  });
});

describe("ReconciliationStatus type shape", () => {
  it("shapes a reconciliation summary", () => {
    const status = {
      totalCount: 500,
      reconciledCount: 350,
      unreconciledCount: 150,
      reconciledPercentage: 70,
    };
    expect(status.reconciledPercentage).toBe(70);
    expect(status.reconciledCount + status.unreconciledCount).toBe(
      status.totalCount,
    );
  });

  it("handles zero total", () => {
    const status = {
      totalCount: 0,
      reconciledCount: 0,
      unreconciledCount: 0,
      reconciledPercentage: 0,
    };
    expect(status.reconciledPercentage).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Zod output schema validation
// ---------------------------------------------------------------------------

describe("bankTransactionItemSchema (output)", () => {
  it("validates a complete transaction item", () => {
    const item = {
      bankTransactionId: "bt-001",
      contactId: "c-001",
      contactName: "Acme Corp",
      reference: "INV-001",
      status: "AUTHORISED",
      type: "RECEIVE",
      total: 1500.0,
      subTotal: 1400.0,
      totalTax: 100.0,
      currencyCode: "KWD",
      isReconciled: false,
      hasAttachments: true,
      date: new Date("2026-06-01"),
      createdAt: new Date("2026-06-01"),
      updatedAt: new Date("2026-06-02"),
    };
    expect(bankTransactionItemSchema.safeParse(item).success).toBe(true);
  });

  it("accepts all null fields", () => {
    const item = {
      bankTransactionId: "bt-002",
      contactId: null,
      contactName: null,
      reference: null,
      status: null,
      type: null,
      total: null,
      subTotal: null,
      totalTax: null,
      currencyCode: null,
      isReconciled: null,
      hasAttachments: null,
      date: null,
      createdAt: null,
      updatedAt: null,
    };
    expect(bankTransactionItemSchema.safeParse(item).success).toBe(true);
  });

  it("rejects missing required bankTransactionId", () => {
    const item = {
      contactId: null,
      contactName: null,
      reference: null,
      status: null,
      type: null,
      total: null,
      subTotal: null,
      totalTax: null,
      currencyCode: null,
      isReconciled: null,
      hasAttachments: null,
      date: null,
      createdAt: null,
      updatedAt: null,
    };
    expect(bankTransactionItemSchema.safeParse(item).success).toBe(false);
  });
});

describe("bankTransactionDetailSchema (output)", () => {
  it("validates a complete detail object", () => {
    const detail = {
      bankTransactionId: "bt-001",
      contactId: "c-001",
      contactName: "Acme Corp",
      reference: "INV-001",
      status: "AUTHORISED",
      type: "RECEIVE",
      total: 1500.0,
      subTotal: 1400.0,
      totalTax: 100.0,
      currencyCode: "KWD",
      currencyRate: 1.0,
      isReconciled: false,
      hasAttachments: true,
      lineAmountTypes: "Inclusive",
      overpaymentId: null,
      prepaymentId: null,
      statusAttributeString: "OK",
      url: "https://xero.com/...",
      validationErrors: null,
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      lineItems: [
        {
          lineItemId: "li-001",
          description: "Consulting services",
          accountCode: "200",
          lineAmount: 1400.0,
          unitAmount: 1400.0,
          quantity: 1,
          taxAmount: 100.0,
          taxType: "OUTPUT",
        },
      ],
    };
    expect(bankTransactionDetailSchema.safeParse(detail).success).toBe(true);
  });

  it("allows empty line items array", () => {
    const detail = {
      bankTransactionId: "bt-002",
      contactId: null,
      contactName: null,
      reference: null,
      status: null,
      type: null,
      total: null,
      subTotal: null,
      totalTax: null,
      currencyCode: null,
      currencyRate: null,
      isReconciled: null,
      hasAttachments: null,
      lineAmountTypes: null,
      overpaymentId: null,
      prepaymentId: null,
      statusAttributeString: null,
      url: null,
      validationErrors: null,
      date: null,
      createdAt: null,
      updatedAt: null,
      lineItems: [],
    };
    expect(bankTransactionDetailSchema.safeParse(detail).success).toBe(true);
  });
});

describe("listBankTransactionsResultSchema (output)", () => {
  it("validates a paginated result", () => {
    const data = {
      transactions: [
        {
          bankTransactionId: "bt-001",
          contactId: null,
          contactName: null,
          reference: null,
          status: null,
          type: null,
          total: null,
          subTotal: null,
          totalTax: null,
          currencyCode: null,
          isReconciled: null,
          hasAttachments: null,
          date: null,
          createdAt: null,
          updatedAt: null,
        },
      ],
      total: 100,
      page: 1,
      limit: 20,
      totalPages: 5,
    };
    expect(listBankTransactionsResultSchema.safeParse(data).success).toBe(true);
  });

  it("rejects missing totalPages", () => {
    const data = {
      transactions: [],
      total: 0,
      page: 1,
      limit: 20,
    };
    expect(listBankTransactionsResultSchema.safeParse(data).success).toBe(false);
  });
});

describe("reconciliationStatusSchema (output)", () => {
  it("validates a reconciliation summary", () => {
    const data = {
      totalCount: 500,
      reconciledCount: 350,
      unreconciledCount: 150,
      reconciledPercentage: 70,
    };
    expect(reconciliationStatusSchema.safeParse(data).success).toBe(true);
  });

  it("validates zero total", () => {
    const data = {
      totalCount: 0,
      reconciledCount: 0,
      unreconciledCount: 0,
      reconciledPercentage: 0,
    };
    expect(reconciliationStatusSchema.safeParse(data).success).toBe(true);
  });

  it("rejects missing fields", () => {
    expect(reconciliationStatusSchema.safeParse({ totalCount: 500 }).success).toBe(false);
  });
});
