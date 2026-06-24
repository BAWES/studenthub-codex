import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

// Mock revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    invoice: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock session
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue(undefined),
}));

const {
  listInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} = await import("../actions");

// ---------------------------------------------------------------------------
// admin/invoices actions
// ---------------------------------------------------------------------------

describe("admin/invoices actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // listInvoices
  // -----------------------------------------------------------------------

  describe("listInvoices", () => {
    it("returns empty result when no invoices exist", async () => {
      vi.mocked(prisma.invoice.findMany).mockResolvedValue([]);
      vi.mocked(prisma.invoice.count).mockResolvedValue(0);

      const result = await listInvoices({});

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(0);
    });

    it("returns paginated invoice rows", async () => {
      vi.mocked(prisma.invoice.findMany).mockResolvedValue([
        {
          invoice_id: 1,
          transfer_id: 10,
          invoice_date: new Date("2026-06-01"),
          invoice_status: "paid",
          transfer: {
            transfer_id: 10,
            total: { toString: () => "500.000" },
            currency_code: "KWD",
            company: { company_name: "Test Co" },
          },
        } as any,
      ]);
      vi.mocked(prisma.invoice.count).mockResolvedValue(1);

      const result = await listInvoices({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({
        invoice_id: 1,
        transfer_id: 10,
        company_name: "Test Co",
        invoice_status: "paid",
        total: "500.000",
        currency_code: "KWD",
      });
      expect(result.total).toBe(1);
    });

    it("filters by invoice status", async () => {
      vi.mocked(prisma.invoice.findMany).mockResolvedValue([]);
      vi.mocked(prisma.invoice.count).mockResolvedValue(0);

      await listInvoices({ status: "unpaid" });

      const where = vi.mocked(prisma.invoice.findMany).mock.calls[0][0]?.where as any;
      expect(where.invoice_status).toBe("unpaid");
    });
  });

  // -----------------------------------------------------------------------
  // getInvoice
  // -----------------------------------------------------------------------

  describe("getInvoice", () => {
    it("returns invoice detail with candidate payouts", async () => {
      vi.mocked(prisma.invoice.findFirst).mockResolvedValue({
        invoice_id: 1,
        transfer_id: 10,
        invoice_date: new Date("2026-06-01"),
        invoice_status: "paid",
        transfer: {
          transfer_id: 10,
          total: { toString: () => "500.000" },
          company_total: null,
          currency_code: "KWD",
          payment_received_on: null,
          company: {
            company_name: "Test Co",
            company_email: "test@co.com",
          },
          transfer_candidate: [
            {
              tc_id: 1,
              hours: 40,
              paid: 1,
              candidate_total: { toString: () => "400.000" },
              candidate: { candidate_name: "Alice" },
            },
            {
              tc_id: 2,
              hours: 20,
              paid: 0,
              candidate_total: { toString: () => "100.000" },
              candidate: { candidate_name: "Bob" },
            },
          ],
        },
      } as any);

      const result = await getInvoice(1);

      expect(result.invoice).not.toBeNull();
      expect(result.invoice?.invoice_id).toBe(1);
      expect(result.invoice?.invoice_status).toBe("paid");
      expect(result.candidate_payouts).toHaveLength(2);
      expect(result.candidate_payouts[0].candidate_name).toBe("Alice");
      expect(result.candidate_payouts[0].paid).toBe(1);
      expect(result.metrics).toHaveLength(4);
    });

    it("returns null invoice when not found", async () => {
      vi.mocked(prisma.invoice.findFirst).mockResolvedValue(null);

      const result = await getInvoice(999);

      expect(result.invoice).toBeNull();
      expect(result.candidate_payouts).toEqual([]);
      expect(result.metrics).toEqual([]);
    });

    it("requires positive invoice ID", async () => {
      await expect(getInvoice(-1)).rejects.toThrow();
    });
  });

  // -----------------------------------------------------------------------
  // createInvoice
  // -----------------------------------------------------------------------

  describe("createInvoice", () => {
    it("creates an invoice with minimal fields", async () => {
      vi.mocked(prisma.invoice.create).mockResolvedValue({
        invoice_id: 1,
      } as any);

      const result = await createInvoice({
        invoice_status: "unpaid",
      });

      expect(result.invoice_id).toBe(1);
      expect(vi.mocked(prisma.invoice.create).mock.calls[0][0]?.data).toMatchObject({
        invoice_status: "unpaid",
      });
    });

    it("creates an invoice with all fields", async () => {
      vi.mocked(prisma.invoice.create).mockResolvedValue({
        invoice_id: 2,
      } as any);

      await createInvoice({
        transfer_id: 10,
        invoice_date: "2026-06-15",
        invoice_status: "paid",
      });

      const data = vi.mocked(prisma.invoice.create).mock.calls[0][0]?.data as any;
      expect(data.transfer_id).toBe(10);
      expect(data.invoice_date).toBeInstanceOf(Date);
      expect(data.invoice_status).toBe("paid");
    });

    it("creates invoice with default status when only minimal data given", async () => {
      vi.mocked(prisma.invoice.create).mockResolvedValue({
        invoice_id: 3,
      } as any);

      const result = await createInvoice({} as any);

      expect(result.invoice_id).toBe(3);
      const data = vi.mocked(prisma.invoice.create).mock.calls[0][0]?.data as any;
      expect(data.invoice_status).toBe("unpaid");
    });
  });

  // -----------------------------------------------------------------------
  // updateInvoice
  // -----------------------------------------------------------------------

  describe("updateInvoice", () => {
    it("updates invoice status", async () => {
      vi.mocked(prisma.invoice.update).mockResolvedValue({} as any);

      const result = await updateInvoice({
        invoiceId: 1,
        invoice_status: "paid",
      });

      expect(result.invoice_id).toBe(1);
      expect(vi.mocked(prisma.invoice.update).mock.calls[0][0]?.data).toMatchObject({
        invoice_status: "paid",
      });
    });

    it("only includes provided fields in update data", async () => {
      vi.mocked(prisma.invoice.update).mockResolvedValue({} as any);

      await updateInvoice({
        invoiceId: 5,
        transfer_id: 20,
      });

      const data = vi.mocked(prisma.invoice.update).mock.calls[0][0]?.data as any;
      expect(data.transfer_id).toBe(20);
      expect(data.invoice_status).toBeUndefined();
      expect(data.invoice_date).toBeUndefined();
    });

    it("converts invoice_date string to Date", async () => {
      vi.mocked(prisma.invoice.update).mockResolvedValue({} as any);

      await updateInvoice({
        invoiceId: 1,
        invoice_date: "2026-07-01",
      });

      const data = vi.mocked(prisma.invoice.update).mock.calls[0][0]?.data as any;
      expect(data.invoice_date).toBeInstanceOf(Date);
    });

    it("throws on missing invoiceId", async () => {
      await expect(updateInvoice({} as any)).rejects.toThrow();
    });
  });

  // -----------------------------------------------------------------------
  // deleteInvoice
  // -----------------------------------------------------------------------

  describe("deleteInvoice", () => {
    it("soft-deletes an invoice", async () => {
      vi.mocked(prisma.invoice.update).mockResolvedValue({} as any);

      const result = await deleteInvoice({ invoiceId: 1 });

      expect(result.invoice_id).toBe(1);
      expect(vi.mocked(prisma.invoice.update).mock.calls[0][0]?.data).toMatchObject({
        deleted: 1,
      });
    });

    it("throws on invalid invoice ID", async () => {
      await expect(deleteInvoice({ invoiceId: -1 })).rejects.toThrow();
    });
  });
});
