import { describe, it, expect } from "vitest";
import {
  bankTransactionItemSchema,
  listBankTransactionsResultSchema,
  reconciliationStatusSchema,
  bankTransactionDetailSchema,
} from "./schemas";

/**
 * Page migration test for admin/xero.
 *
 * Verifies the data contract between page and action.
 */
describe("admin xero page — data contract", () => {
  it("bankTransactionItemSchema validates a full entry", () => {
    const r = bankTransactionItemSchema.safeParse({
      bankTransactionId: "bt-001",
      contactId: "c-001",
      contactName: "Acme Corp",
      reference: "INV-001",
      status: "AUTHORISED",
      type: "ACCREC",
      total: 1500.0,
      subTotal: 1250.0,
      totalTax: 250.0,
      currencyCode: "KWD",
      isReconciled: true,
      hasAttachments: false,
      date: new Date("2026-06-14"),
      createdAt: new Date("2026-06-10"),
      updatedAt: new Date("2026-06-14"),
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.contactName).toBe("Acme Corp");
      expect(r.data.isReconciled).toBe(true);
    }
  });

  it("bankTransactionItemSchema accepts nullable fields", () => {
    const r = bankTransactionItemSchema.safeParse({
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
    });
    expect(r.success).toBe(true);
  });

  it("bankTransactionItemSchema rejects missing bankTransactionId", () => {
    const r = bankTransactionItemSchema.safeParse({
      contactName: "Test",
      contactId: null,
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
    });
    expect(r.success).toBe(false);
  });

  it("listBankTransactionsResultSchema validates result", () => {
    const r = listBankTransactionsResultSchema.safeParse({
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
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("reconciliationStatusSchema validates result", () => {
    const r = reconciliationStatusSchema.safeParse({
      totalCount: 100,
      reconciledCount: 75,
      unreconciledCount: 25,
      reconciledPercentage: 75.0,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.reconciledPercentage).toBe(75.0);
    }
  });

  it("reconciliationStatusSchema rejects missing fields", () => {
    const r = reconciliationStatusSchema.safeParse({
      totalCount: 100,
    });
    expect(r.success).toBe(false);
  });

  it("bankTransactionDetailSchema validates with line items", () => {
    const r = bankTransactionDetailSchema.safeParse({
      bankTransactionId: "bt-003",
      contactId: null,
      contactName: "Vendor Co",
      reference: "PO-123",
      status: "PAID",
      type: "ACCPAY",
      total: 500.0,
      subTotal: 420.0,
      totalTax: 80.0,
      currencyCode: "USD",
      isReconciled: true,
      hasAttachments: false,
      date: new Date("2026-06-01"),
      createdAt: new Date("2026-05-28"),
      updatedAt: new Date("2026-06-01"),
      currencyRate: 0.309,
      lineAmountTypes: "Exclusive",
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
          lineAmount: 420.0,
          unitAmount: 420.0,
          quantity: 1,
          taxAmount: 80.0,
          taxType: "15% VAT on Expenses",
        },
      ],
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.lineItems).toHaveLength(1);
      expect(r.data.lineItems[0].description).toBe("Consulting services");
    }
  });
});
