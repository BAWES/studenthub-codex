import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

// Mock revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    transfer: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
    },
    transfer_candidate: {
      findMany: vi.fn(),
    },
    invoice: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

// Mock session
vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn().mockResolvedValue(undefined),
}));

const {
  listTransfers,
  getTransferDetail,
  approveTransfer,
  rejectTransfer,
} = await import("../actions");

// ---------------------------------------------------------------------------
// admin/transfers actions
// ---------------------------------------------------------------------------

describe("admin/transfers actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // listTransfers
  // -----------------------------------------------------------------------

  describe("listTransfers", () => {
    it("returns empty result when no transfers exist", async () => {
      vi.mocked(prisma.transfer.findMany).mockResolvedValue([]);
      vi.mocked(prisma.transfer.count).mockResolvedValue(0);

      const result = await listTransfers({});

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(0);
    });

    it("returns paginated transfer rows", async () => {
      vi.mocked(prisma.transfer.findMany).mockResolvedValue([
        {
          transfer_id: 1,
          transfer_status: 10,
          total: 5000,
          currency_code: "KWD",
          company: { company_name: "Acme Corp" },
          transfer_candidate: [{ tc_id: 1 }, { tc_id: 2 }],
          start_date: new Date("2026-06-01"),
          end_date: new Date("2026-06-15"),
          transfer_created_at: new Date("2026-06-01T10:00:00Z"),
        } as any,
      ]);
      vi.mocked(prisma.transfer.count).mockResolvedValue(1);

      const result = await listTransfers({ page: 1, limit: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({
        id: 1,
        company: "Acme Corp",
        status: "Pending",
        statusCode: 10,
        total: "5000",
        currencyCode: "KWD",
      });
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it("filters by companyId", async () => {
      vi.mocked(prisma.transfer.findMany).mockResolvedValue([]);
      vi.mocked(prisma.transfer.count).mockResolvedValue(0);

      await listTransfers({ companyId: 5 });

      const where = vi.mocked(prisma.transfer.findMany).mock.calls[0][0]?.where as any;
      expect(where.company_id).toBe(5);
    });

    it("filters by status", async () => {
      vi.mocked(prisma.transfer.findMany).mockResolvedValue([]);
      vi.mocked(prisma.transfer.count).mockResolvedValue(0);

      await listTransfers({ status: 20 });

      const where = vi.mocked(prisma.transfer.findMany).mock.calls[0][0]?.where as any;
      expect(where.transfer_status).toBe(20);
    });

    it("handles missing company name gracefully", async () => {
      vi.mocked(prisma.transfer.findMany).mockResolvedValue([
        {
          transfer_id: 2,
          transfer_status: 20,
          total: null,
          currency_code: null,
          company: null,
          transfer_candidate: [],
          start_date: null,
          end_date: null,
          transfer_created_at: null,
        } as any,
      ]);
      vi.mocked(prisma.transfer.count).mockResolvedValue(1);

      const result = await listTransfers({});

      expect(result.items[0].company).toBe("No company");
      expect(result.items[0].total).toBeNull();
      expect(result.items[0].period).toBe("N/A");
    });
  });

  // -----------------------------------------------------------------------
  // getTransferDetail
  // -----------------------------------------------------------------------

  describe("getTransferDetail", () => {
    const transferData = {
      transfer_id: 1,
      total: 5000,
      company_total: 6000,
      transfer_cost: 1000,
      transfer_status: 10,
      currency_code: "KWD",
      start_date: new Date("2026-06-01"),
      end_date: new Date("2026-06-15"),
      payment_received_on: null,
      transfer_created_at: new Date("2026-06-01T10:00:00Z"),
      transfer_updated_at: new Date("2026-06-02T10:00:00Z"),
      company: { company_name: "Acme Corp", company_email: "acme@test.com" },
    } as any;

    it("returns transfer detail with candidates and invoices", async () => {
      vi.mocked(prisma.$transaction).mockResolvedValue([
        transferData,
        [
          {
            tc_id: 10,
            candidate: { candidate_name: "John Doe" },
            hours: 40,
            candidate_total: 500,
            paid: 1,
          },
        ],
        [
          {
            invoice_id: 100,
            invoice_date: new Date("2026-06-10"),
            invoice_status: 1,
          },
        ],
      ]);

      const result = await getTransferDetail(1);

      expect(result.transfer).not.toBeNull();
      expect(result.transfer?.transferId).toBe(1);
      expect(result.transfer?.status).toBe("Pending");
      expect(result.transfer?.companyName).toBe("Acme Corp");
      expect(result.candidates).toHaveLength(1);
      expect(result.candidates[0].candidateName).toBe("John Doe");
      expect(result.candidates[0].hours).toBe(40);
      expect(result.invoices).toHaveLength(1);
      expect(result.metrics).toHaveLength(4);
    });

    it("throws error for non-existent transfer", async () => {
      vi.mocked(prisma.$transaction).mockResolvedValue([
        null,
        [],
        [],
      ]);

      await expect(getTransferDetail(999)).rejects.toThrow(
        "Transfer #999 not found",
      );
    });

    it("throws error for invalid transfer ID (negative)", async () => {
      await expect(getTransferDetail(-1)).rejects.toThrow();
    });

    it("returns empty arrays when no candidates or invoices", async () => {
      vi.mocked(prisma.$transaction).mockResolvedValue([
        transferData,
        [],
        [],
      ]);

      const result = await getTransferDetail(1);

      expect(result.candidates).toHaveLength(0);
      expect(result.invoices).toHaveLength(0);
      expect(result.metrics[0].value).toBe(0);
      expect(result.metrics[1].value).toBe(0);
    });
  });

  // -----------------------------------------------------------------------
  // approveTransfer
  // -----------------------------------------------------------------------

  describe("approveTransfer", () => {
    it("approves a pending transfer (status 10 -> 20)", async () => {
      vi.mocked(prisma.transfer.findUnique).mockResolvedValue({
        transfer_id: 1,
        transfer_status: 10,
      } as any);
      vi.mocked(prisma.transfer.update).mockResolvedValue({} as any);

      const result = await approveTransfer(1);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(vi.mocked(prisma.transfer.update).mock.calls[0][0]?.data).toMatchObject({
        transfer_status: 20,
      });
    });

    it("rejects approve for non-existent transfer", async () => {
      vi.mocked(prisma.transfer.findUnique).mockResolvedValue(null);

      const result = await approveTransfer(999);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Transfer not found");
    });

    it("rejects approve for already-approved transfer", async () => {
      vi.mocked(prisma.transfer.findUnique).mockResolvedValue({
        transfer_id: 1,
        transfer_status: 20,
      } as any);

      const result = await approveTransfer(1);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Only pending transfers can be approved");
    });

    it("rejects approve for cancelled transfer", async () => {
      vi.mocked(prisma.transfer.findUnique).mockResolvedValue({
        transfer_id: 1,
        transfer_status: 30,
      } as any);

      const result = await approveTransfer(1);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Only pending transfers can be approved");
    });

    it("returns error for invalid transfer ID", async () => {
      const result = await approveTransfer(-1);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("returns error on Prisma failure", async () => {
      vi.mocked(prisma.transfer.findUnique).mockResolvedValue({
        transfer_id: 1,
        transfer_status: 10,
      } as any);
      vi.mocked(prisma.transfer.update).mockRejectedValue(new Error("DB error"));

      const result = await approveTransfer(1);

      expect(result.success).toBe(false);
      expect(result.error).toBe("DB error");
    });

    it("calls revalidatePath after approval", async () => {
      const { revalidatePath } = await import("next/cache");
      vi.mocked(prisma.transfer.findUnique).mockResolvedValue({
        transfer_id: 1,
        transfer_status: 10,
      } as any);
      vi.mocked(prisma.transfer.update).mockResolvedValue({} as any);

      await approveTransfer(1);

      expect(revalidatePath).toHaveBeenCalledWith("/admin/transfers");
      expect(revalidatePath).toHaveBeenCalledWith("/admin/transfers/1");
    });
  });

  // -----------------------------------------------------------------------
  // rejectTransfer
  // -----------------------------------------------------------------------

  describe("rejectTransfer", () => {
    it("rejects a pending transfer (status 10 -> 30)", async () => {
      vi.mocked(prisma.transfer.findUnique).mockResolvedValue({
        transfer_id: 1,
        transfer_status: 10,
      } as any);
      vi.mocked(prisma.transfer.update).mockResolvedValue({} as any);

      const result = await rejectTransfer(1, "Budget constraints");

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(vi.mocked(prisma.transfer.update).mock.calls[0][0]?.data).toMatchObject({
        transfer_status: 30,
      });
    });

    it("returns error for empty reason", async () => {
      const result = await rejectTransfer(1, "");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Reason is required");
    });

    it("returns error for whitespace-only reason", async () => {
      const result = await rejectTransfer(1, "   ");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Reason is required");
    });

    it("rejects reject for non-existent transfer", async () => {
      vi.mocked(prisma.transfer.findUnique).mockResolvedValue(null);

      const result = await rejectTransfer(999, "No longer needed");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Transfer not found");
    });

    it("rejects reject for already-approved transfer", async () => {
      vi.mocked(prisma.transfer.findUnique).mockResolvedValue({
        transfer_id: 1,
        transfer_status: 20,
      } as any);

      const result = await rejectTransfer(1, "Already approved");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Only pending transfers can be rejected");
    });

    it("returns error on Prisma failure", async () => {
      vi.mocked(prisma.transfer.findUnique).mockResolvedValue({
        transfer_id: 1,
        transfer_status: 10,
      } as any);
      vi.mocked(prisma.transfer.update).mockRejectedValue(new Error("Connection lost"));

      const result = await rejectTransfer(1, "Budget cuts");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Connection lost");
    });

    it("calls revalidatePath after rejection", async () => {
      const { revalidatePath } = await import("next/cache");
      vi.mocked(prisma.transfer.findUnique).mockResolvedValue({
        transfer_id: 1,
        transfer_status: 10,
      } as any);
      vi.mocked(prisma.transfer.update).mockResolvedValue({} as any);

      await rejectTransfer(1, "Not needed");

      expect(revalidatePath).toHaveBeenCalledWith("/admin/transfers");
      expect(revalidatePath).toHaveBeenCalledWith("/admin/transfers/1");
    });
  });
});
