import { describe, it, expect } from "vitest";
import {
  listBankTransactionsSchema,
  getBankTransactionSchema,
  bankTransactionItemSchema,
  listBankTransactionsResultSchema,
  reconciliationStatusSchema,
  bankTransactionDetailSchema,
} from "./schemas";

/**
 * Page migration test for admin/xero.
 *
 * Verifies the data contract between page and action.
 * Full rendering tests require Playwright (server component).
 */
describe("admin xero page — data contract", () => {
  describe("listBankTransactionsSchema", () => {
    it("parses with defaults", () => {
      const r = listBankTransactionsSchema.safeParse({});
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.page).toBe(1);
        expect(r.data.limit).toBe(20);
        expect(r.data.sortBy).toBe("date");
        expect(r.data.sortDir).toBe("desc");
      }
    });

    it("accepts all filter parameters", () => {
      const r = listBankTransactionsSchema.safeParse({
        isReconciled: false,
        dateFrom: "2026-01-01",
        dateTo: "2026-06-30",
        contactName: "Acme Corp",
        type: "ACCREC",
        status: "ACTIVE",
        reference: "INV-001",
        sortBy: "total",
        sortDir: "asc",
        page: 2,
        limit: 50,
      });
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.sortBy).toBe("total");
        expect(r.data.page).toBe(2);
      }
    });

    it("rejects invalid date format", () => {
      const r = listBankTransactionsSchema.safeParse({
        dateFrom: "01-01-2026",
      });
      expect(r.success).toBe(false);
    });

    it("rejects invalid sortBy value", () => {
      const r = listBankTransactionsSchema.safeParse({
        sortBy: "invalid",
      });
      expect(r.success).toBe(false);
    });

    it("rejects limit over 100", () => {
      const r = listBankTransactionsSchema.safeParse({
        limit: 200,
      });
      expect(r.success).toBe(false);
    });
  });

  describe("getBankTransactionSchema", () => {
    it("validates with bankTransactionId", () => {
      const r = getBankTransactionSchema.safeParse({
        bankTransactionId: "txn-001",
      });
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.bankTransactionId).toBe("txn-001");
      }
    });

    it("rejects empty bankTransactionId", () => {
      const r = getBankTransactionSchema.safeParse({
        bankTransactionId: "",
      });
      expect(r.success).toBe(false);
    });

    it("rejects missing bankTransactionId", () => {
      const r = getBankTransactionSchema.safeParse({});
      expect(r.success).toBe(false);
    });
  });

  describe("bankTransactionItemSchema", () => {
    it("validates a full transaction entry", () => {
      const r = bankTransactionItemSchema.safeParse({
        bankTransactionId: "txn-001",
        contactId: "contact-001",
        contactName: "Acme Corp",
        reference: "INV-001",
        status: "ACTIVE",
        type: "ACCREC",
        total: 1500.00,
        subTotal: 1363.64,
        totalTax: 136.36,
        currencyCode: "USD",
        isReconciled: false,
        hasAttachments: true,
        date: new Date("2026-06-01"),
        createdAt: new Date("2026-06-01"),
        updatedAt: new Date("2026-06-15"),
      });
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.bankTransactionId).toBe("txn-001");
        expect(r.data.contactName).toBe("Acme Corp");
      }
    });

    it("accepts null optional fields", () => {
      const r = bankTransactionItemSchema.safeParse({
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
      });
      expect(r.success).toBe(true);
    });

    it("rejects missing required bankTransactionId", () => {
      const r = bankTransactionItemSchema.safeParse({
        contactName: "Acme",
      });
      expect(r.success).toBe(false);
    });
  });

  describe("listBankTransactionsResultSchema", () => {
    it("validates paginated result", () => {
      const r = listBankTransactionsResultSchema.safeParse({
        transactions: [
          {
            bankTransactionId: "txn-001",
            contactId: null,
            contactName: "Acme Corp",
            reference: null,
            status: "ACTIVE",
            type: "ACCREC",
            total: 1500,
            subTotal: null,
            totalTax: null,
            currencyCode: "USD",
            isReconciled: false,
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

    it("validates empty result", () => {
      const r = listBankTransactionsResultSchema.safeParse({
        transactions: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });
      expect(r.success).toBe(true);
    });
  });

  describe("reconciliationStatusSchema", () => {
    it("validates reconciliation status", () => {
      const r = reconciliationStatusSchema.safeParse({
        totalCount: 100,
        reconciledCount: 75,
        unreconciledCount: 25,
        reconciledPercentage: 75,
      });
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.reconciledPercentage).toBe(75);
      }
    });
  });

  describe("bankTransactionDetailSchema", () => {
    it("validates full detail with line items", () => {
      const r = bankTransactionDetailSchema.safeParse({
        bankTransactionId: "txn-001",
        contactId: "contact-001",
        contactName: "Acme Corp",
        reference: "INV-001",
        status: "ACTIVE",
        type: "ACCREC",
        total: 1500.00,
        subTotal: 1363.64,
        totalTax: 136.36,
        currencyCode: "USD",
        isReconciled: false,
        hasAttachments: true,
        date: new Date("2026-06-01"),
        createdAt: new Date("2026-06-01"),
        updatedAt: new Date("2026-06-15"),
        currencyRate: 1.0,
        lineAmountTypes: "Exclusive",
        overpaymentId: null,
        prepaymentId: null,
        statusAttributeString: null,
        url: null,
        validationErrors: null,
        lineItems: [
          {
            lineItemId: "li-001",
            description: "Web development",
            accountCode: "200",
            lineAmount: 1500,
            unitAmount: 1500,
            quantity: 1,
            taxAmount: 0,
            taxType: "OUTPUT",
          },
        ],
      });
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.lineItems).toHaveLength(1);
        expect(r.data.lineItems[0].description).toBe("Web development");
      }
    });

    it("accepts null line items and detail fields", () => {
      const r = bankTransactionDetailSchema.safeParse({
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
});
