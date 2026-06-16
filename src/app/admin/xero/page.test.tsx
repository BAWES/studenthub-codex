import { describe, it, expect } from "vitest";
import {
  listBankTransactionsSchema,
  getBankTransactionSchema,
  bankTransactionItemSchema,
  bankTransactionDetailSchema,
  listBankTransactionsResultSchema,
  reconciliationStatusSchema,
} from "./schemas";

/**
 * Page migration test for admin/xero.
 *
 * Verifies the data contract between page and action.
 * Full rendering tests require Playwright (server component).
 */

const validItem = {
  bankTransactionId: "txn-001",
  contactId: "contact-123",
  contactName: "Acme Corp",
  reference: "INV-001",
  status: "AUTHORISED",
  type: "ACCREC",
  total: 1500.0,
  subTotal: 1363.64,
  totalTax: 136.36,
  currencyCode: "USD",
  isReconciled: false,
  hasAttachments: false,
  date: new Date("2025-01-15"),
  createdAt: new Date("2025-01-15T10:00:00Z"),
  updatedAt: new Date("2025-01-15T10:00:00Z"),
};

describe("admin xero page — data contract", () => {
  // ── Input: listBankTransactionsSchema ──
  describe("listBankTransactionsSchema", () => {
    it("parses with defaults", () => {
      const r = listBankTransactionsSchema.safeParse({});
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.page).toBe(1);
        expect(r.data.limit).toBe(20);
      }
    });

    it("accepts all filter params", () => {
      const r = listBankTransactionsSchema.safeParse({
        isReconciled: true,
        dateFrom: "2025-01-01",
        dateTo: "2025-06-30",
        contactName: "Acme",
        type: "ACCREC",
        status: "AUTHORISED",
        reference: "INV-001",
        sortBy: "date",
        sortDir: "desc",
        page: 2,
        limit: 50,
      });
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.isReconciled).toBe(true);
        expect(r.data.page).toBe(2);
      }
    });

    it("rejects invalid date format", () => {
      expect(
        listBankTransactionsSchema.safeParse({ dateFrom: "01-01-2025" })
          .success,
      ).toBe(false);
    });

    it("rejects limit over 100", () =>
      expect(listBankTransactionsSchema.safeParse({ limit: 200 }).success).toBe(
        false,
      ));

    it("rejects invalid sortBy", () =>
      expect(listBankTransactionsSchema.safeParse({ sortBy: "invalid" }).success).toBe(
        false,
      ));
  });

  // ── Input: getBankTransactionSchema ──
  describe("getBankTransactionSchema", () => {
    it("accepts valid bankTransactionId", () => {
      const r = getBankTransactionSchema.safeParse({
        bankTransactionId: "txn-001",
      });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.bankTransactionId).toBe("txn-001");
    });

    it("rejects empty bankTransactionId", () =>
      expect(getBankTransactionSchema.safeParse({ bankTransactionId: "" }).success).toBe(
        false,
      ));

    it("rejects missing bankTransactionId", () =>
      expect(getBankTransactionSchema.safeParse({}).success).toBe(false));
  });

  // ── Output: bankTransactionItemSchema ──
  describe("bankTransactionItemSchema", () => {
    it("validates a full transaction item", () => {
      const r = bankTransactionItemSchema.safeParse(validItem);
      expect(r.success).toBe(true);
    });

    it("accepts nullable fields as null", () => {
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

    it("rejects missing required fields", () =>
      expect(bankTransactionItemSchema.safeParse({}).success).toBe(false));
  });

  // ── Output: bankTransactionDetailSchema ──
  describe("bankTransactionDetailSchema", () => {
    const validDetail = {
      bankTransactionId: "txn-001",
      contactId: "contact-123",
      contactName: "Acme Corp",
      reference: "INV-001",
      status: "AUTHORISED",
      type: "ACCREC",
      total: 1500.0,
      subTotal: 1363.64,
      totalTax: 136.36,
      currencyCode: "USD",
      isReconciled: false,
      hasAttachments: false,
      date: new Date("2025-01-15"),
      createdAt: new Date("2025-01-15T10:00:00Z"),
      updatedAt: new Date("2025-01-15T10:00:00Z"),
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
          description: "Consulting services",
          accountCode: "200",
          lineAmount: 1500.0,
          unitAmount: 1500.0,
          quantity: 1,
          taxAmount: 136.36,
          taxType: "OUTPUT",
        },
      ],
    };

    it("validates a full detail with line items", () => {
      const r = bankTransactionDetailSchema.safeParse(validDetail);
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.lineItems).toHaveLength(1);
        expect(r.data.lineItems[0].lineItemId).toBe("li-001");
      }
    });

    it("accepts empty line items array", () => {
      const r = bankTransactionDetailSchema.safeParse({
        ...validDetail,
        lineItems: [],
      });
      expect(r.success).toBe(true);
    });
  });

  // ── Output: listBankTransactionsResultSchema ──
  describe("listBankTransactionsResultSchema", () => {
    it("validates paginated result", () => {
      const r = listBankTransactionsResultSchema.safeParse({
        transactions: [validItem],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
      expect(r.success).toBe(true);
    });

    it("validates result with zero total", () => {
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

  // ── Output: reconciliationStatusSchema ──
  describe("reconciliationStatusSchema", () => {
    it("validates a full status object", () => {
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

    it("rejects missing fields", () =>
      expect(reconciliationStatusSchema.safeParse({}).success).toBe(false));
  });
});
