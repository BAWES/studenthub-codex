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
      findFirst: vi.fn(),
    },
  },
}));

// Mock session
vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn().mockResolvedValue(undefined),
}));

const { getCandidateIdRequest } = await import("../actions");

// ---------------------------------------------------------------------------
// admin/candidate-account-requests/[id] actions
// ---------------------------------------------------------------------------

describe("admin/candidate-account-requests/[id] actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // getCandidateIdRequest
  // -----------------------------------------------------------------------

  describe("getCandidateIdRequest", () => {
    const sampleRow = {
      cir_uuid: "cir_abc123",
      candidate_ids: "CID001, CID002",
      status: "pending",
      rejection_reason: null,
      created_by_name: "Admin User",
      updated_by_name: null,
      created_at: "2026-06-14T08:00:00.000Z",
      updated_at: null,
    };

    it("returns request detail when found", async () => {
      vi.mocked(prisma.candidate_id_request.findFirst).mockResolvedValue({
        cir_uuid: "cir_abc123",
        candidate_ids: "CID001, CID002",
        status: "pending",
        rejection_reason: null,
        staff_candidate_id_request_created_byTostaff: { staff_name: "Admin User" },
        staff_candidate_id_request_updated_byTostaff: null,
        created_at: new Date("2026-06-14T08:00:00Z"),
        updated_at: null,
      } as any);

      const result = await getCandidateIdRequest("cir_abc123");

      expect(result.request).not.toBeNull();
      expect(result.request).toMatchObject(sampleRow);
      expect(prisma.candidate_id_request.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { cir_uuid: "cir_abc123" },
        }),
      );
    });

    it("returns null when request not found", async () => {
      vi.mocked(prisma.candidate_id_request.findFirst).mockResolvedValue(null);

      const result = await getCandidateIdRequest("cir_nonexistent");

      expect(result.request).toBeNull();
    });

    it("throws for empty UUID", async () => {
      await expect(getCandidateIdRequest("")).rejects.toThrow(
        "Candidate ID Request UUID is required",
      );
      expect(prisma.candidate_id_request.findFirst).not.toHaveBeenCalled();
    });

    it("reports rejected status", async () => {
      vi.mocked(prisma.candidate_id_request.findFirst).mockResolvedValue({
        cir_uuid: "cir_rejected",
        candidate_ids: "CID003",
        status: "rejected",
        rejection_reason: "Invalid documentation",
        staff_candidate_id_request_created_byTostaff: { staff_name: "Admin User" },
        staff_candidate_id_request_updated_byTostaff: null,
        created_at: new Date("2026-06-14T09:00:00Z"),
        updated_at: new Date("2026-06-14T10:00:00Z"),
      } as any);

      const result = await getCandidateIdRequest("cir_rejected");

      expect(result.request).not.toBeNull();
      expect(result.request?.status).toBe("rejected");
      expect(result.request?.rejection_reason).toBe("Invalid documentation");
    });

    it("output shape matches getCandidateIdRequestOutputSchema", async () => {
      vi.mocked(prisma.candidate_id_request.findFirst).mockResolvedValue({
        cir_uuid: "cir_schema_test",
        candidate_ids: "CID099",
        status: "approved",
        rejection_reason: null,
        staff_candidate_id_request_created_byTostaff: { staff_name: "Schema Tester" },
        staff_candidate_id_request_updated_byTostaff: { staff_name: "Updater" },
        created_at: new Date("2026-06-14T11:00:00Z"),
        updated_at: new Date("2026-06-14T12:00:00Z"),
      } as any);

      const result = await getCandidateIdRequest("cir_schema_test");

      expect(result.request).toMatchObject({
        cir_uuid: expect.any(String),
        candidate_ids: expect.any(String),
        status: expect.any(String),
        created_by_name: expect.any(String),
        updated_by_name: expect.any(String),
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });
    });

    it("requires admin.read capability", async () => {
      const { requireCapability } = await import("@/modules/auth/session");
      vi.mocked(prisma.candidate_id_request.findFirst).mockResolvedValue(null);

      await getCandidateIdRequest("cir_perm_check");

      expect(requireCapability).toHaveBeenCalledWith("admin.read");
    });
  });
});
