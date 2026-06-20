import { describe, it, expect } from "vitest";
import {
  getBankTransactionSchema,
  bankTransactionItemSchema,
  bankTransactionDetailSchema,
} from "@/modules/admin/xero/schemas";

/**
 * Page migration test for admin/xero/[bankTransactionId].
 *
 * Verifies the data contract between page and action.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("admin xero detail page — data contract", () => {
  it("getBankTransactionSchema validates with bankTransactionId", () => {
    const r = getBankTransactionSchema.safeParse({
      bankTransactionId: "txn-001",
    });
    expect(r.success).toBe(true);
  });

  it("getBankTransactionSchema rejects empty bankTransactionId", () => {
    const r = getBankTransactionSchema.safeParse({ bankTransactionId: "" });
    expect(r.success).toBe(false);
  });

  it("getBankTransactionSchema rejects missing bankTransactionId", () => {
    const r = getBankTransactionSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("bankTransactionItemSchema validates a transaction item", () => {
    const r = bankTransactionItemSchema.safeParse({
      bankTransactionId: "txn-001",
      contactId: "contact-001",
      contactName: "Acme Corp",
      reference: "INV-001",
      status: "ACTIVE",
      type: "RECEIVE",
      total: 1000.0,
      subTotal: 900.0,
      totalTax: 100.0,
      currencyCode: "KWD",
      isReconciled: false,
      hasAttachments: false,
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(r.success).toBe(true);
  });

  it("bankTransactionItemSchema accepts nullable fields", () => {
    const r = bankTransactionItemSchema.safeParse({
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
    });
    expect(r.success).toBe(true);
  });

  it("bankTransactionDetailSchema validates a full transaction detail", () => {
    const r = bankTransactionDetailSchema.safeParse({
      bankTransactionId: "txn-001",
      contactId: "contact-001",
      contactName: "Acme Corp",
      reference: "INV-001",
      status: "ACTIVE",
      type: "RECEIVE",
      total: 1000.0,
      subTotal: 900.0,
      totalTax: 100.0,
      currencyCode: "KWD",
      isReconciled: false,
      hasAttachments: true,
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
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
          accountCode: "2000",
          lineAmount: 500.0,
          unitAmount: 500.0,
          quantity: 1,
          taxAmount: 50.0,
          taxType: "OUTPUT",
        },
      ],
    });
    expect(r.success).toBe(true);
  });

  it("bankTransactionDetailSchema accepts empty lineItems", () => {
    const r = bankTransactionDetailSchema.safeParse({
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
      currencyRate: null,
      lineAmountTypes: null,
      overpaymentId: null,
      prepaymentId: null,
      statusAttributeString: null,
      url: null,
      validationErrors: null,
      lineItems: [],
    });
    expect(r.success).toBe(true);
  });
});
