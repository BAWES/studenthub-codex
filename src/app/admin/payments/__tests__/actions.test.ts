import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

// Mock revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    bank_transaction: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
    },
  },
}));

// Mock session
vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn().mockResolvedValue(undefined),
}));

const { listPayments, getPayment } = await import("../actions");

// ---------------------------------------------------------------------------
// admin/payments actions
// ---------------------------------------------------------------------------

describe("admin/payments actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // listPayments
  // -----------------------------------------------------------------------

  describe("listPayments", () => {
    it("returns empty result when no payments exist", async () => {
      vi.mocked(prisma.bank_transaction.findMany).mockResolvedValue([]);
      vi.mocked(prisma.bank_transaction.count).mockResolvedValue(0);

      const result = await listPayments({});

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(0);
    });

    it("returns paginated payment rows with contact and line items", async () => {
      vi.mocked(prisma.bank_transaction.findMany).mockResolvedValue([
        {
          bank_transaction_id: "txn-001",
          reference: "REF-100",
          status: "AUTHORISED",
          type: "RECEIVE",
          total: 1000.0,
          currency_code: "KWD",
          date: new Date("2026-06-10"),
          is_reconciled: false,
          bank_transaction_contact: { contact_id: "c-1", name: "Test Corp" },
          bank_transaction_line_item: [{ line_item_id: "li-1" }, { line_item_id: "li-2" }],
        } as any,
      ]);
      vi.mocked(prisma.bank_transaction.count).mockResolvedValue(1);

      const result = await listPayments({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({
        bank_transaction_id: "txn-001",
        reference: "REF-100",
        status: "AUTHORISED",
        type: "RECEIVE",
        total: 1000.0,
        currency_code: "KWD",
        contact_name: "Test Corp",
        is_reconciled: false,
        line_items_count: 2,
      });
      expect(result.total).toBe(1);
    });

    it("returns default values for missing contacts and line items", async () => {
      vi.mocked(prisma.bank_transaction.findMany).mockResolvedValue([
        {
          bank_transaction_id: "txn-002",
          reference: null,
          status: null,
          type: null,
          total: null,
          currency_code: null,
          date: new Date("2026-06-11"),
          is_reconciled: null,
          bank_transaction_contact: null,
          bank_transaction_line_item: [],
        } as any,
      ]);
      vi.mocked(prisma.bank_transaction.count).mockResolvedValue(1);

      const result = await listPayments({});

      expect(result.items[0].contact_name).toBeNull();
      expect(result.items[0].line_items_count).toBe(0);
      expect(result.items[0].reference).toBeNull();
    });

    it("filters by status and type", async () => {
      vi.mocked(prisma.bank_transaction.findMany).mockResolvedValue([]);
      vi.mocked(prisma.bank_transaction.count).mockResolvedValue(0);

      await listPayments({ status: "AUTHORISED", type: "RECEIVE" });

      const where = vi.mocked(prisma.bank_transaction.findMany).mock.calls[0][0]?.where as any;
      expect(where.status).toBe("AUTHORISED");
      expect(where.type).toBe("RECEIVE");
    });

    it("filters by date range", async () => {
      vi.mocked(prisma.bank_transaction.findMany).mockResolvedValue([]);
      vi.mocked(prisma.bank_transaction.count).mockResolvedValue(0);

      await listPayments({
        dateFrom: "2026-06-01",
        dateTo: "2026-06-30",
      });

      const where = vi.mocked(prisma.bank_transaction.findMany).mock.calls[0][0]?.where as any;
      expect(where.date).toBeDefined();
      expect(where.date.gte).toBeInstanceOf(Date);
      expect(where.date.lte).toBeInstanceOf(Date);
    });
  });

  // -----------------------------------------------------------------------
  // getPayment
  // -----------------------------------------------------------------------

  describe("getPayment", () => {
    it("returns payment detail with line items and contact", async () => {
      vi.mocked(prisma.bank_transaction.findFirst).mockResolvedValue({
        bank_transaction_id: "txn-001",
        reference: "REF-100",
        status: "AUTHORISED",
        type: "RECEIVE",
        total: 1000.0,
        sub_total: 900.0,
        total_tax: 100.0,
        currency_rate: 1.0,
        currency_code: "KWD",
        line_amount_types: "Inclusive",
        has_attachments: false,
        is_reconciled: false,
        date: new Date("2026-06-10"),
        created_at: new Date("2026-06-09"),
        updated_at: new Date("2026-06-10"),
        bank_transaction_contact: { contact_id: "c-1", name: "Test Corp" },
        bank_transaction_line_item: [
          {
            line_item_id: "li-1",
            account_code: "200",
            description: "Service fee",
            line_amount: 500.0,
            quantity: 1,
            unit_amount: 500.0,
          },
        ],
      } as any);

      const result = await getPayment("txn-001");

      expect(result.payment).not.toBeNull();
      expect(result.payment?.bank_transaction_id).toBe("txn-001");
      expect(result.payment?.reference).toBe("REF-100");
      expect(result.payment?.status).toBe("AUTHORISED");
      expect(result.payment?.contact).toMatchObject({
        contact_id: "c-1",
        name: "Test Corp",
      });
      expect(result.line_items).toHaveLength(1);
      expect(result.line_items[0].account_code).toBe("200");
      expect(result.metrics).toHaveLength(5);
    });

    it("returns null payment when not found", async () => {
      vi.mocked(prisma.bank_transaction.findFirst).mockResolvedValue(null);

      const result = await getPayment("nonexistent");

      expect(result.payment).toBeNull();
      expect(result.line_items).toEqual([]);
      expect(result.metrics).toEqual([]);
    });

    it("returns payment with all nullable fields as null", async () => {
      vi.mocked(prisma.bank_transaction.findFirst).mockResolvedValue({
        bank_transaction_id: "txn-min",
        reference: null,
        status: null,
        type: null,
        total: null,
        sub_total: null,
        total_tax: null,
        currency_rate: null,
        currency_code: null,
        line_amount_types: null,
        has_attachments: null,
        is_reconciled: null,
        date: new Date("2026-06-10"),
        created_at: null,
        updated_at: null,
        bank_transaction_contact: null,
        bank_transaction_line_item: [],
      } as any);

      const result = await getPayment("txn-min");

      expect(result.payment).not.toBeNull();
      expect(result.payment?.reference).toBeNull();
      expect(result.payment?.contact).toBeNull();
      expect(result.line_items).toEqual([]);
      expect(result.metrics[0].value).toBe(0);
    });

    it("throws on empty payment ID", async () => {
      await expect(getPayment("")).rejects.toThrow();
    });
  });
});
