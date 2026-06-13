import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

// Mock revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    candidate_id_request: {
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
  listCandidateIdRequests,
  getCandidateIdRequest,
  updateCandidateIdRequestStatus,
} = await import("../actions");

describe("admin/candidate-account-requests actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // listCandidateIdRequests
  // -----------------------------------------------------------------------

  describe("listCandidateIdRequests", () => {
    it("returns paginated results with default values", async () => {
      vi.mocked(prisma.candidate_id_request.findMany).mockResolvedValue([]);
      vi.mocked(prisma.candidate_id_request.count).mockResolvedValue(0);

      const result = await listCandidateIdRequests({});

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
      expect(result.items).toEqual([]);
    });

    it("filters by status 'pending' (varchar)", async () => {
      vi.mocked(prisma.candidate_id_request.findMany).mockResolvedValue([]);
      vi.mocked(prisma.candidate_id_request.count).mockResolvedValue(0);

      await listCandidateIdRequests({ status: "pending" });

      const whereArg = vi.mocked(prisma.candidate_id_request.findMany).mock.calls[0][0]?.where as any;
      expect(whereArg.status).toBe("pending");
    });

    it("filters by status 'approved' (varchar)", async () => {
      vi.mocked(prisma.candidate_id_request.findMany).mockResolvedValue([]);
      vi.mocked(prisma.candidate_id_request.count).mockResolvedValue(0);

      await listCandidateIdRequests({ status: "approved" });

      const whereArg = vi.mocked(prisma.candidate_id_request.findMany).mock.calls[0][0]?.where as any;
      expect(whereArg.status).toBe("approved");
    });

    it("filters by status 'rejected' (varchar)", async () => {
      vi.mocked(prisma.candidate_id_request.findMany).mockResolvedValue([]);
      vi.mocked(prisma.candidate_id_request.count).mockResolvedValue(0);

      await listCandidateIdRequests({ status: "rejected" });

      const whereArg = vi.mocked(prisma.candidate_id_request.findMany).mock.calls[0][0]?.where as any;
      expect(whereArg.status).toBe("rejected");
    });

    it("includes staff relations", async () => {
      vi.mocked(prisma.candidate_id_request.findMany).mockResolvedValue([]);
      vi.mocked(prisma.candidate_id_request.count).mockResolvedValue(0);

      await listCandidateIdRequests({});

      const includeArg = vi.mocked(prisma.candidate_id_request.findMany).mock.calls[0][0]?.include as any;
      expect(includeArg.staff_candidate_id_request_created_byTostaff).toEqual({ select: { staff_name: true } });
      expect(includeArg.staff_candidate_id_request_updated_byTostaff).toEqual({ select: { staff_name: true } });
    });

    it("maps rows with staff names", async () => {
      const mockRow = {
        cir_uuid: "cir-uuid-1",
        candidate_ids: "101,102,103",
        status: "pending",
        rejection_reason: null,
        created_at: new Date("2024-01-15T10:00:00Z"),
        updated_at: new Date("2024-01-15T12:00:00Z"),
        staff_candidate_id_request_created_byTostaff: { staff_name: "Alice" },
        staff_candidate_id_request_updated_byTostaff: { staff_name: "Bob" },
      };

      vi.mocked(prisma.candidate_id_request.findMany).mockResolvedValue([mockRow] as any);
      vi.mocked(prisma.candidate_id_request.count).mockResolvedValue(1);

      const result = await listCandidateIdRequests({});

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({
        cir_uuid: "cir-uuid-1",
        candidate_ids: "101,102,103",
        status: "pending",
        rejection_reason: null,
        created_by_name: "Alice",
        updated_by_name: "Bob",
      });
    });

    it("handles null staff gracefully", async () => {
      const mockRow = {
        cir_uuid: "cir-uuid-2",
        candidate_ids: null,
        status: null,
        rejection_reason: null,
        created_at: null,
        updated_at: null,
        staff_candidate_id_request_created_byTostaff: null,
        staff_candidate_id_request_updated_byTostaff: null,
      };

      vi.mocked(prisma.candidate_id_request.findMany).mockResolvedValue([mockRow] as any);
      vi.mocked(prisma.candidate_id_request.count).mockResolvedValue(1);

      const result = await listCandidateIdRequests({});

      expect(result.items[0].created_by_name).toBeNull();
      expect(result.items[0].updated_by_name).toBeNull();
    });

    it("computes totalPages correctly", async () => {
      vi.mocked(prisma.candidate_id_request.findMany).mockResolvedValue([]);
      vi.mocked(prisma.candidate_id_request.count).mockResolvedValue(55);

      const result = await listCandidateIdRequests({ limit: 20, page: 1 });

      expect(result.totalPages).toBe(3);
    });
  });

  // -----------------------------------------------------------------------
  // getCandidateIdRequest
  // -----------------------------------------------------------------------

  describe("getCandidateIdRequest", () => {
    it("returns request detail when found", async () => {
      const mockRow = {
        cir_uuid: "cir-uuid-1",
        candidate_ids: "101,102",
        status: "approved",
        rejection_reason: null,
        created_at: new Date("2024-01-15T10:00:00Z"),
        updated_at: new Date("2024-01-15T12:00:00Z"),
        staff_candidate_id_request_created_byTostaff: { staff_name: "Alice" },
        staff_candidate_id_request_updated_byTostaff: null,
      };

      vi.mocked(prisma.candidate_id_request.findFirst).mockResolvedValue(mockRow as any);

      const result = await getCandidateIdRequest("cir-uuid-1");

      expect(result.request).not.toBeNull();
      expect(result.request?.cir_uuid).toBe("cir-uuid-1");
      expect(result.request?.candidate_ids).toBe("101,102");
      expect(result.request?.status).toBe("approved");
      expect(result.request?.created_by_name).toBe("Alice");
    });

    it("returns null request when not found", async () => {
      vi.mocked(prisma.candidate_id_request.findFirst).mockResolvedValue(null);

      const result = await getCandidateIdRequest("non-existent");

      expect(result.request).toBeNull();
    });

    it("includes staff relations in query", async () => {
      vi.mocked(prisma.candidate_id_request.findFirst).mockResolvedValue(null);

      await getCandidateIdRequest("cir-uuid-1");

      const includeArg = vi.mocked(prisma.candidate_id_request.findFirst).mock.calls[0][0]?.include as any;
      expect(includeArg.staff_candidate_id_request_created_byTostaff).toEqual({ select: { staff_name: true } });
      expect(includeArg.staff_candidate_id_request_updated_byTostaff).toEqual({ select: { staff_name: true } });
    });

    it("throws on invalid input", async () => {
      await expect(getCandidateIdRequest("")).rejects.toThrow();
    });
  });

  // -----------------------------------------------------------------------
  // updateCandidateIdRequestStatus
  // -----------------------------------------------------------------------

  describe("updateCandidateIdRequestStatus", () => {
    it("updates status to approved", async () => {
      vi.mocked(prisma.candidate_id_request.findUnique).mockResolvedValue({
        cir_uuid: "cir-uuid-1",
        status: "pending",
      } as any);
      vi.mocked(prisma.candidate_id_request.update).mockResolvedValue({} as any);

      const result = await updateCandidateIdRequestStatus({
        cirUuid: "cir-uuid-1",
        status: "approved",
      });

      expect(result.operation).toBe("success");
      expect(result.message).toContain("approved");

      const updateData = vi.mocked(prisma.candidate_id_request.update).mock.calls[0][0]?.data as any;
      expect(updateData.status).toBe("approved");
    });

    it("updates status to rejected", async () => {
      vi.mocked(prisma.candidate_id_request.findUnique).mockResolvedValue({
        cir_uuid: "cir-uuid-1",
        status: "pending",
      } as any);
      vi.mocked(prisma.candidate_id_request.update).mockResolvedValue({} as any);

      const result = await updateCandidateIdRequestStatus({
        cirUuid: "cir-uuid-1",
        status: "rejected",
      });

      expect(result.operation).toBe("success");
      expect(result.message).toContain("rejected");

      const updateData = vi.mocked(prisma.candidate_id_request.update).mock.calls[0][0]?.data as any;
      expect(updateData.status).toBe("rejected");
    });

    it("stores rejection_reason when rejecting with reason", async () => {
      vi.mocked(prisma.candidate_id_request.findUnique).mockResolvedValue({
        cir_uuid: "cir-uuid-1",
        status: "pending",
      } as any);
      vi.mocked(prisma.candidate_id_request.update).mockResolvedValue({} as any);

      await updateCandidateIdRequestStatus({
        cirUuid: "cir-uuid-1",
        status: "rejected",
        rejectionReason: "Incomplete documentation",
      });

      const updateData = vi.mocked(prisma.candidate_id_request.update).mock.calls[0][0]?.data as any;
      expect(updateData.status).toBe("rejected");
      expect(updateData.rejection_reason).toBe("Incomplete documentation");
    });

    it("sets updated_at during status update", async () => {
      vi.mocked(prisma.candidate_id_request.findUnique).mockResolvedValue({
        cir_uuid: "cir-uuid-1",
        status: "pending",
      } as any);
      vi.mocked(prisma.candidate_id_request.update).mockResolvedValue({} as any);

      await updateCandidateIdRequestStatus({
        cirUuid: "cir-uuid-1",
        status: "approved",
      });

      const updateData = vi.mocked(prisma.candidate_id_request.update).mock.calls[0][0]?.data as any;
      expect(updateData.updated_at).toBeInstanceOf(Date);
    });

    it("returns error for non-existent request", async () => {
      vi.mocked(prisma.candidate_id_request.findUnique).mockResolvedValue(null);

      const result = await updateCandidateIdRequestStatus({
        cirUuid: "non-existent",
        status: "approved",
      });

      expect(result.operation).toBe("error");
      expect(result.message).toContain("not found");
    });

    it("returns error for invalid input", async () => {
      const result = await updateCandidateIdRequestStatus({
        cirUuid: "",
        status: "approved",
      } as any);

      expect(result.operation).toBe("error");
      expect(result.message).toBeDefined();
    });

    it("returns error on Prisma failure", async () => {
      vi.mocked(prisma.candidate_id_request.findUnique).mockResolvedValue({
        cir_uuid: "cir-uuid-1",
        status: "pending",
      } as any);
      vi.mocked(prisma.candidate_id_request.update).mockRejectedValue(new Error("DB error"));

      const result = await updateCandidateIdRequestStatus({
        cirUuid: "cir-uuid-1",
        status: "approved",
      });

      expect(result.operation).toBe("error");
      expect(result.message).toBe("DB error");
    });
  });
});
