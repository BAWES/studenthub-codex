import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

// Mock revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    store_assignment_request: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock session
vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn().mockResolvedValue(undefined),
}));

const {
  listStoreAssignmentRequests,
  getStoreAssignmentRequest,
  updateStoreAssignmentRequestStatus,
} = await import("../actions");

describe("admin/user-requests actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // listStoreAssignmentRequests
  // -----------------------------------------------------------------------

  describe("listStoreAssignmentRequests", () => {
    it("returns paginated results with default values", async () => {
      vi.mocked(prisma.store_assignment_request.findMany).mockResolvedValue([]);
      vi.mocked(prisma.store_assignment_request.count).mockResolvedValue(0);

      const result = await listStoreAssignmentRequests({});

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
      expect(result.items).toEqual([]);
    });

    it("filters by status 'pending' (converts to 0)", async () => {
      vi.mocked(prisma.store_assignment_request.findMany).mockResolvedValue([]);
      vi.mocked(prisma.store_assignment_request.count).mockResolvedValue(0);

      await listStoreAssignmentRequests({ status: "pending" });

      const whereArg = vi.mocked(prisma.store_assignment_request.findMany).mock.calls[0][0]?.where as any;
      expect(whereArg.status).toBe(0);
    });

    it("filters by status 'approved' (converts to 1)", async () => {
      vi.mocked(prisma.store_assignment_request.findMany).mockResolvedValue([]);
      vi.mocked(prisma.store_assignment_request.count).mockResolvedValue(0);

      await listStoreAssignmentRequests({ status: "approved" });

      const whereArg = vi.mocked(prisma.store_assignment_request.findMany).mock.calls[0][0]?.where as any;
      expect(whereArg.status).toBe(1);
    });

    it("filters by candidateId", async () => {
      vi.mocked(prisma.store_assignment_request.findMany).mockResolvedValue([]);
      vi.mocked(prisma.store_assignment_request.count).mockResolvedValue(0);

      await listStoreAssignmentRequests({ candidateId: 42 });

      const whereArg = vi.mocked(prisma.store_assignment_request.findMany).mock.calls[0][0]?.where as any;
      expect(whereArg.candidate_id).toBe(42);
    });

    it("filters by storeId", async () => {
      vi.mocked(prisma.store_assignment_request.findMany).mockResolvedValue([]);
      vi.mocked(prisma.store_assignment_request.count).mockResolvedValue(0);

      await listStoreAssignmentRequests({ storeId: 7 });

      const whereArg = vi.mocked(prisma.store_assignment_request.findMany).mock.calls[0][0]?.where as any;
      expect(whereArg.store_id).toBe(7);
    });

    it("includes candidate and store relations", async () => {
      vi.mocked(prisma.store_assignment_request.findMany).mockResolvedValue([]);
      vi.mocked(prisma.store_assignment_request.count).mockResolvedValue(0);

      await listStoreAssignmentRequests({});

      const includeArg = vi.mocked(prisma.store_assignment_request.findMany).mock.calls[0][0]?.include as any;
      expect(includeArg.candidate).toEqual({ select: { candidate_name: true } });
      expect(includeArg.store).toEqual({ select: { store_name: true } });
    });

    it("maps rows with candidate and store names", async () => {
      const mockRow = {
        sar_uuid: "sar-uuid-1",
        candidate_id: 42,
        store_id: 7,
        currency_code: "KWD",
        status: 0,
        created_at: new Date("2024-01-15T10:00:00Z"),
        updated_at: new Date("2024-01-15T12:00:00Z"),
        candidate: { candidate_name: "John Doe" },
        store: { store_name: "Main Store" },
      };

      vi.mocked(prisma.store_assignment_request.findMany).mockResolvedValue([mockRow] as any);
      vi.mocked(prisma.store_assignment_request.count).mockResolvedValue(1);

      const result = await listStoreAssignmentRequests({});

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({
        sar_uuid: "sar-uuid-1",
        candidate_id: 42,
        candidate_name: "John Doe",
        store_id: 7,
        store_name: "Main Store",
        currency_code: "KWD",
        status: 0,
      });
    });

    it("handles null candidate and store gracefully", async () => {
      const mockRow = {
        sar_uuid: "sar-uuid-2",
        candidate_id: null,
        store_id: null,
        currency_code: null,
        status: null,
        created_at: null,
        updated_at: null,
        candidate: null,
        store: null,
      };

      vi.mocked(prisma.store_assignment_request.findMany).mockResolvedValue([mockRow] as any);
      vi.mocked(prisma.store_assignment_request.count).mockResolvedValue(1);

      const result = await listStoreAssignmentRequests({});

      expect(result.items[0].candidate_name).toBeNull();
      expect(result.items[0].store_name).toBeNull();
    });

    it("computes totalPages correctly", async () => {
      vi.mocked(prisma.store_assignment_request.findMany).mockResolvedValue([]);
      vi.mocked(prisma.store_assignment_request.count).mockResolvedValue(55);

      const result = await listStoreAssignmentRequests({ limit: 20, page: 1 });

      expect(result.totalPages).toBe(3);
    });
  });

  // -----------------------------------------------------------------------
  // getStoreAssignmentRequest
  // -----------------------------------------------------------------------

  describe("getStoreAssignmentRequest", () => {
    it("returns request detail when found", async () => {
      const mockRow = {
        sar_uuid: "sar-uuid-1",
        candidate_id: 42,
        store_id: 7,
        currency_code: "KWD",
        status: 0,
        created_at: new Date("2024-01-15T10:00:00Z"),
        updated_at: new Date("2024-01-15T12:00:00Z"),
        candidate: { candidate_name: "John Doe" },
        store: { store_name: "Main Store" },
      };

      vi.mocked(prisma.store_assignment_request.findFirst).mockResolvedValue(mockRow as any);

      const result = await getStoreAssignmentRequest("sar-uuid-1");

      expect(result.request).not.toBeNull();
      expect(result.request?.sar_uuid).toBe("sar-uuid-1");
      expect(result.request?.candidate_name).toBe("John Doe");
      expect(result.request?.store_name).toBe("Main Store");
    });

    it("returns null request when not found", async () => {
      vi.mocked(prisma.store_assignment_request.findFirst).mockResolvedValue(null);

      const result = await getStoreAssignmentRequest("non-existent");

      expect(result.request).toBeNull();
    });

    it("includes candidate and store in query", async () => {
      vi.mocked(prisma.store_assignment_request.findFirst).mockResolvedValue(null);

      await getStoreAssignmentRequest("sar-uuid-1");

      const includeArg = vi.mocked(prisma.store_assignment_request.findFirst).mock.calls[0][0]?.include as any;
      expect(includeArg.candidate).toEqual({ select: { candidate_name: true } });
      expect(includeArg.store).toEqual({ select: { store_name: true } });
    });

    it("throws on invalid input", async () => {
      await expect(getStoreAssignmentRequest("")).rejects.toThrow();
    });
  });

  // -----------------------------------------------------------------------
  // updateStoreAssignmentRequestStatus
  // -----------------------------------------------------------------------

  describe("updateStoreAssignmentRequestStatus", () => {
    it("updates status to approved (int 1)", async () => {
      vi.mocked(prisma.store_assignment_request.findUnique).mockResolvedValue({
        sar_uuid: "sar-uuid-1",
        status: 0,
      } as any);
      vi.mocked(prisma.store_assignment_request.update).mockResolvedValue({} as any);

      const result = await updateStoreAssignmentRequestStatus({
        sarUuid: "sar-uuid-1",
        status: "approved",
      });

      expect(result.operation).toBe("success");
      expect(result.message).toContain("approved");

      const updateData = vi.mocked(prisma.store_assignment_request.update).mock.calls[0][0]?.data as any;
      expect(updateData.status).toBe(1);
    });

    it("updates status to pending (int 0)", async () => {
      vi.mocked(prisma.store_assignment_request.findUnique).mockResolvedValue({
        sar_uuid: "sar-uuid-1",
        status: 1,
      } as any);
      vi.mocked(prisma.store_assignment_request.update).mockResolvedValue({} as any);

      const result = await updateStoreAssignmentRequestStatus({
        sarUuid: "sar-uuid-1",
        status: "pending",
      });

      expect(result.operation).toBe("success");
      expect(result.message).toContain("pending");

      const updateData = vi.mocked(prisma.store_assignment_request.update).mock.calls[0][0]?.data as any;
      expect(updateData.status).toBe(0);
    });

    it("sets updated_at during status update", async () => {
      vi.mocked(prisma.store_assignment_request.findUnique).mockResolvedValue({
        sar_uuid: "sar-uuid-1",
        status: 0,
      } as any);
      vi.mocked(prisma.store_assignment_request.update).mockResolvedValue({} as any);

      await updateStoreAssignmentRequestStatus({
        sarUuid: "sar-uuid-1",
        status: "approved",
      });

      const updateData = vi.mocked(prisma.store_assignment_request.update).mock.calls[0][0]?.data as any;
      expect(updateData.updated_at).toBeInstanceOf(Date);
    });

    it("returns error for non-existent request", async () => {
      vi.mocked(prisma.store_assignment_request.findUnique).mockResolvedValue(null);

      const result = await updateStoreAssignmentRequestStatus({
        sarUuid: "non-existent",
        status: "approved",
      });

      expect(result.operation).toBe("error");
      expect(result.message).toContain("not found");
    });

    it("returns error for invalid input", async () => {
      const result = await updateStoreAssignmentRequestStatus({
        sarUuid: "",
        status: "approved",
      } as any);

      expect(result.operation).toBe("error");
      expect(result.message).toBeDefined();
    });

    it("returns error on Prisma failure", async () => {
      vi.mocked(prisma.store_assignment_request.findUnique).mockResolvedValue({
        sar_uuid: "sar-uuid-1",
        status: 0,
      } as any);
      vi.mocked(prisma.store_assignment_request.update).mockRejectedValue(new Error("DB error"));

      const result = await updateStoreAssignmentRequestStatus({
        sarUuid: "sar-uuid-1",
        status: "approved",
      });

      expect(result.operation).toBe("error");
      expect(result.message).toBe("DB error");
    });
  });
});
