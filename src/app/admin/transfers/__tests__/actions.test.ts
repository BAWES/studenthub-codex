import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

// Mock revalidatePath from next/cache
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
    transfer_file_entry: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

// Mock session
vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn().mockResolvedValue(undefined),
  requireRoleCapability: vi.fn().mockResolvedValue({ role: "admin" }),
}));

// Mock format helpers
vi.mock("@/modules/workspace/format", () => ({
  formatDate: vi.fn((d: Date | null) => d ? "2026-01-15" : ""),
  formatMoney: vi.fn((v: number | null, c: string) => `${c} ${v ?? 0}`),
}));

const {
  listTransfers,
  getTransferDetail,
  approveTransfer,
  rejectTransfer,
} = await import("../actions");

describe("admin/transfers actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listTransfers", () => {
    it("returns paginated transfer rows", async () => {
      const mockRows = [
        {
          transfer_id: 1,
          total: null,
          company_total: 5000,
          transfer_status: 10,
          start_date: new Date("2026-01-01"),
          end_date: new Date("2026-01-15"),
          currency_code: "KWD",
          company: { company_name: "Test Corp" },
        },
      ];
      vi.mocked(prisma.transfer.findMany).mockResolvedValue(mockRows as any);
      vi.mocked(prisma.transfer.count).mockResolvedValue(1);

      const result = await listTransfers({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe(1);
      expect(result.items[0].company).toBe("Test Corp");
      expect(result.items[0].status).toBe("Pending");
      expect(result.items[0].statusCode).toBe(10);
      expect(result.total).toBe(1);
    });

    it("filters by status when provided", async () => {
      vi.mocked(prisma.transfer.findMany).mockResolvedValue([]);
      vi.mocked(prisma.transfer.count).mockResolvedValue(0);

      await listTransfers({ status: 20 });

      const where = vi.mocked(prisma.transfer.findMany).mock.calls[0][0]?.where as any;
      expect(where.transfer_status).toBe(20);
    });

    it("returns empty result on invalid input", async () => {
      const result = await listTransfers({ page: -1 as any });
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe("getTransferDetail", () => {
    it("returns full transfer detail with candidates and invoices", async () => {
      const mockTransfer = {
        transfer_id: 1,
        total: null,
        company_total: 5000,
        transfer_cost: 100,
        transfer_status: 10,
        start_date: new Date("2026-01-01"),
        end_date: new Date("2026-01-15"),
        payment_received_on: null,
        transfer_created_at: new Date(),
        transfer_updated_at: new Date(),
        currency_code: "KWD",
        company: { company_name: "Test Corp", company_email: "test@corp.com" },
        staff_transfer_transfer_created_byTostaff: { staff_name: "Admin" },
        staff_transfer_transfer_updated_byTostaff: { staff_name: "Admin" },
      };

      vi.mocked(prisma.$transaction).mockResolvedValue([
        mockTransfer,
        [],
        [],
        [],
      ] as any);

      const result = await getTransferDetail(1);

      expect(result.transfer.transferId).toBe(1);
      expect(result.transfer.companyName).toBe("Test Corp");
      expect(result.transfer.status).toBe("Pending");
      expect(result.metrics).toHaveLength(4);
      expect(result.candidates).toHaveLength(0);
      expect(result.invoices).toHaveLength(0);
    });

    it("throws on invalid transfer ID", async () => {
      await expect(getTransferDetail(-1)).rejects.toThrow("Transfer ID is required");
    });

    it("throws when transfer not found", async () => {
      vi.mocked(prisma.$transaction).mockResolvedValue([null, [], [], []] as any);

      await expect(getTransferDetail(999)).rejects.toThrow("Transfer #999 not found");
    });
  });

  describe("approveTransfer", () => {
    it("approves a pending transfer", async () => {
      vi.mocked(prisma.transfer.findUnique).mockResolvedValue({
        transfer_id: 1,
        transfer_status: 10,
      } as any);
      vi.mocked(prisma.transfer.update).mockResolvedValue({} as any);

      const result = await approveTransfer(1);

      expect(result.success).toBe(true);
      expect(vi.mocked(prisma.transfer.update).mock.calls[0][0]?.data).toEqual({
        transfer_status: 20,
      });
    });

    it("rejects approval for non-pending transfer", async () => {
      vi.mocked(prisma.transfer.findUnique).mockResolvedValue({
        transfer_id: 1,
        transfer_status: 20,
      } as any);

      const result = await approveTransfer(1);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Only pending transfers");
    });

    it("returns error for non-existent transfer", async () => {
      vi.mocked(prisma.transfer.findUnique).mockResolvedValue(null);

      const result = await approveTransfer(999);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Transfer not found");
    });
  });

  describe("rejectTransfer", () => {
    it("rejects a pending transfer", async () => {
      vi.mocked(prisma.transfer.findUnique).mockResolvedValue({
        transfer_id: 1,
        transfer_status: 10,
      } as any);
      vi.mocked(prisma.transfer.update).mockResolvedValue({} as any);

      const result = await rejectTransfer(1, "Incorrect amount");

      expect(result.success).toBe(true);
      expect(vi.mocked(prisma.transfer.update).mock.calls[0][0]?.data).toEqual({
        transfer_status: 30,
      });
    });

    it("rejects approval for non-pending transfer", async () => {
      vi.mocked(prisma.transfer.findUnique).mockResolvedValue({
        transfer_id: 1,
        transfer_status: 20,
      } as any);

      const result = await rejectTransfer(1, "Already approved");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Only pending transfers");
    });

    it("requires a reason", async () => {
      const result = await rejectTransfer(1, "");

      expect(result.success).toBe(false);
      expect(result.error).toContain("required");
    });
  });
});
