import { describe, it, expect } from "vitest";
import {
  bankTransactionItemSchema,
  bankTransactionDetailSchema,
  listBankTransactionsResultSchema,
  reconciliationStatusSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// bankTransactionItemSchema
// ---------------------------------------------------------------------------
describe("bankTransactionItemSchema", () => {
  const validItem = {
    bankTransactionId: "txn-001",
    contactId: "contact-123",
    contactName: "Acme Corp",
    reference: "INV-001",
    status: "AUTHORISED",
    type: "ACCREC",
    total: 1500.00,
    subTotal: 1363.64,
    totalTax: 136.36,
    currencyCode: "USD",
    isReconciled: false,
    hasAttachments: false,
    date: new Date("2025-01-15"),
    createdAt: new Date("2025-01-15T10:00:00Z"),
    updatedAt: new Date("2025-01-15T10:00:00Z"),
  };

  it("accepts a valid item", () => {
    expect(bankTransactionItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts nullable fields", () => {
    expect(
      bankTransactionItemSchema.safeParse({
        bankTransactionId: "txn-002",
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
      }).success,
    ).toBe(true);
  });

  it("accepts zero total", () => {
    expect(bankTransactionItemSchema.safeParse({ ...validItem, total: 0 }).success).toBe(true);
  });

  it("rejects missing bankTransactionId", () => {
    const { bankTransactionId: _, ...rest } = validItem;
    expect(bankTransactionItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for total", () => {
    expect(bankTransactionItemSchema.safeParse({ ...validItem, total: "free" }).success).toBe(false);
  });

  it("rejects wrong type for isReconciled", () => {
    expect(bankTransactionItemSchema.safeParse({ ...validItem, isReconciled: "yes" }).success).toBe(false);
  });

  it("rejects wrong type for date", () => {
    expect(bankTransactionItemSchema.safeParse({ ...validItem, date: "2025-01-15" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// bankTransactionDetailSchema
// ---------------------------------------------------------------------------
describe("bankTransactionDetailSchema", () => {
  const validDetail = {
    bankTransactionId: "txn-001",
    contactId: "contact-123",
    contactName: "Acme Corp",
    reference: "INV-001",
    status: "AUTHORISED",
    type: "ACCREC",
    total: 1500.00,
    subTotal: 1363.64,
    totalTax: 136.36,
    currencyCode: "USD",
    isReconciled: false,
    hasAttachments: false,
    date: new Date("2025-01-15"),
    createdAt: new Date("2025-01-15T10:00:00Z"),
    updatedAt: new Date("2025-01-15T10:00:00Z"),
    currencyRate: 1.0,
    lineAmountTypes: "Inclusive",
    overpaymentId: null,
    prepaymentId: null,
    statusAttributeString: null,
    url: null,
    validationErrors: null,
    lineItems: [
      {
        lineItemId: "li-001",
        description: "Consulting services",
        accountCode: "200",
        lineAmount: 1500.00,
        unitAmount: 1500.00,
        quantity: 1,
        taxAmount: 136.36,
        taxType: "OUTPUT",
      },
    ],
  };

  it("accepts a valid detail", () => {
    expect(bankTransactionDetailSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts nullable fields", () => {
    expect(
      bankTransactionDetailSchema.safeParse({
        ...validDetail,
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
        currencyRate: null,
        lineAmountTypes: null,
      }).success,
    ).toBe(true);
  });

  it("accepts empty lineItems", () => {
    expect(
      bankTransactionDetailSchema.safeParse({ ...validDetail, lineItems: [] }).success,
    ).toBe(true);
  });

  it("rejects missing bankTransactionId", () => {
    const { bankTransactionId: _, ...rest } = validDetail;
    expect(bankTransactionDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing lineItems", () => {
    const { lineItems: _, ...rest } = validDetail;
    expect(bankTransactionDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type in lineItems", () => {
    expect(
      bankTransactionDetailSchema.safeParse({
        ...validDetail,
        lineItems: [{ lineItemId: "bad", description: "Missing required fields" }],
      }).success,
    ).toBe(false);
  });

  it("rejects wrong type for quantity", () => {
    expect(
      bankTransactionDetailSchema.safeParse({
        ...validDetail,
        lineItems: [{ ...validDetail.lineItems[0], quantity: "one" }],
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listBankTransactionsResultSchema
// ---------------------------------------------------------------------------
describe("listBankTransactionsResultSchema", () => {
  const validResult = {
    transactions: [
      {
        bankTransactionId: "txn-001",
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
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid result", () => {
    expect(listBankTransactionsResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty transactions array", () => {
    expect(
      listBankTransactionsResultSchema.safeParse({
        ...validResult,
        transactions: [],
        total: 0,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing transactions", () => {
    const { transactions: _, ...rest } = validResult;
    expect(listBankTransactionsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = validResult;
    expect(listBankTransactionsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing page", () => {
    const { page: _, ...rest } = validResult;
    expect(listBankTransactionsResultSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// reconciliationStatusSchema
// ---------------------------------------------------------------------------
describe("reconciliationStatusSchema", () => {
  const validStatus = {
    totalCount: 100,
    reconciledCount: 75,
    unreconciledCount: 25,
    reconciledPercentage: 75.0,
  };

  it("accepts a valid status", () => {
    expect(reconciliationStatusSchema.safeParse(validStatus).success).toBe(true);
  });

  it("accepts zero counts", () => {
    expect(
      reconciliationStatusSchema.safeParse({
        totalCount: 0,
        reconciledCount: 0,
        unreconciledCount: 0,
        reconciledPercentage: 0,
      }).success,
    ).toBe(true);
  });

  it("accepts decimal percentage", () => {
    expect(
      reconciliationStatusSchema.safeParse({
        ...validStatus,
        reconciledPercentage: 50.5,
      }).success,
    ).toBe(true);
  });

  it("rejects missing totalCount", () => {
    const { totalCount: _, ...rest } = validStatus;
    expect(reconciliationStatusSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for reconciledPercentage", () => {
    expect(
      reconciliationStatusSchema.safeParse({ ...validStatus, reconciledPercentage: "seventy-five" }).success,
    ).toBe(false);
  });
});
