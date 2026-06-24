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
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock session
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue(undefined),
}));

const {
  getInvoiceDetail,
  updateInvoice,
  deleteInvoice,
} = await import("../actions");

// ---------------------------------------------------------------------------
// admin/invoices actions (refactored API)
// ---------------------------------------------------------------------------

describe("admin/invoices actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // getInvoiceDetail
  // -----------------------------------------------------------------------

  describe("getInvoiceDetail", () => {
    it("returns invoice detail with transfer and company info", async () => {
      vi.mocked(prisma.invoice.findUnique).mockResolvedValue({
        invoice_id: 1,
        invoice_date: new Date("2026-06-01"),
        invoice_status: "paid",
        transfer_id: 10,
        transfer: {
          transfer_id: 10,
          total: { toString: () => "500.000" },
          company_total: null,
          currency_code: "KWD",
          transfer_status: "completed",
          start_date: new Date("2026-05-01"),
          end_date: new Date("2026-05-31"),
          company: { company_id: 1, company_name: "Test Co" },
        },
      } as any);

      const result = await getInvoiceDetail(1);

      expect(result).not.toBeNull();
      expect(result?.invoice_id).toBe(1);
      expect(result?.invoice_status).toBe("paid");
      expect(result?.transfer?.company?.company_name).toBe("Test Co");
    });

    it("returns null when invoice not found", async () => {
      vi.mocked(prisma.invoice.findUnique).mockResolvedValue(null);

      const result = await getInvoiceDetail(999);

      expect(result).toBeNull();
    });

    it("queries with proper include shape", async () => {
      vi.mocked(prisma.invoice.findUnique).mockResolvedValue(null);

      await getInvoiceDetail(1);

      const call = vi.mocked(prisma.invoice.findUnique).mock.calls[0][0];
      expect(call?.where).toEqual({ invoice_id: 1 });
      expect(call?.include).toHaveProperty("transfer");
    });
  });

  // -----------------------------------------------------------------------
  // updateInvoice
  // -----------------------------------------------------------------------

  describe("updateInvoice", () => {
    it("updates invoice status", async () => {
      vi.mocked(prisma.invoice.update).mockResolvedValue({} as any);

      await updateInvoice(1, { invoice_status: "paid" });

      const data = vi.mocked(prisma.invoice.update).mock.calls[0][0]?.data as any;
      expect(data.invoice_status).toBe("paid");
    });

    it("updates invoice date", async () => {
      vi.mocked(prisma.invoice.update).mockResolvedValue({} as any);
      const testDate = new Date("2026-07-01");

      await updateInvoice(1, { invoice_date: testDate });

      const data = vi.mocked(prisma.invoice.update).mock.calls[0][0]?.data as any;
      expect(data.invoice_date).toBe(testDate);
    });

    it("updates transfer_id", async () => {
      vi.mocked(prisma.invoice.update).mockResolvedValue({} as any);

      await updateInvoice(5, { transfer_id: 20 });

      const data = vi.mocked(prisma.invoice.update).mock.calls[0][0]?.data as any;
      expect(data.transfer_id).toBe(20);
    });

    it("sets undefined for omitted optional fields", async () => {
      vi.mocked(prisma.invoice.update).mockResolvedValue({} as any);

      await updateInvoice(1, { invoice_status: "paid" });

      const data = vi.mocked(prisma.invoice.update).mock.calls[0][0]?.data as any;
      expect(data.invoice_status).toBe("paid");
      expect(data.invoice_date).toBeUndefined();
      expect(data.transfer_id).toBeUndefined();
    });

    it("revalidates the invoices path after update", async () => {
      const { revalidatePath } = await import("next/cache");
      vi.mocked(prisma.invoice.update).mockResolvedValue({} as any);

      await updateInvoice(1, { invoice_status: "unpaid" });

      expect(revalidatePath).toHaveBeenCalledWith("/admin/invoices");
    });
  });

  // -----------------------------------------------------------------------
  // deleteInvoice
  // -----------------------------------------------------------------------

  describe("deleteInvoice", () => {
    it("soft-deletes an invoice", async () => {
      vi.mocked(prisma.invoice.update).mockResolvedValue({} as any);

      await deleteInvoice(1);

      const data = vi.mocked(prisma.invoice.update).mock.calls[0][0]?.data as any;
      expect(data.deleted).toBe(1);
    });

    it("revalidates the invoices path after delete", async () => {
      const { revalidatePath } = await import("next/cache");
      vi.mocked(prisma.invoice.update).mockResolvedValue({} as any);

      await deleteInvoice(1);

      expect(revalidatePath).toHaveBeenCalledWith("/admin/invoices");
    });
  });
});
