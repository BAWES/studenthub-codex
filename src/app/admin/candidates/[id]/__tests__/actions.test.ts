import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

// Mock revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock Prisma — the actions use prisma.candidate (not prisma.users)
vi.mock("@/lib/prisma", () => ({
  prisma: {
    candidate: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock session
vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn().mockResolvedValue(undefined),
}));

const {
  getCandidateDetail,
  updateCandidateStatus,
  updateCandidate,
  deleteCandidate,
} = await import("../actions");

// ---------------------------------------------------------------------------
// admin/candidates/[id] actions
// ---------------------------------------------------------------------------

describe("admin/candidates/[id] actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // getCandidateDetail
  // -----------------------------------------------------------------------

  describe("getCandidateDetail", () => {
    const candidateData = {
      candidate_id: 1,
      candidate_name: "John Doe",
      candidate_name_ar: "جون دو",
      candidate_email: "john@example.com",
      candidate_phone: "50000000",
      candidate_status: 10,
      candidate_gender: 1,
      candidate_birth_date: new Date("1998-06-15"),
      candidate_hourly_rate: { toNumber: () => 5 },
      candidate_objective: "Looking for opportunities",
      currency_code: "KWD",
      candidate_created_at: new Date("2026-01-01T10:00:00Z"),
      candidate_updated_at: new Date("2026-06-01T10:00:00Z"),
      candidate_resume: "/resumes/john.pdf",
      candidate_civil_photo_front: "/civil/front.jpg",
      candidate_civil_photo_back: null,
      candidate_personal_photo: null,
      store: { store_name: "Main Branch" },
      country: { country_name_en: "Kuwait" },
      university: { university_name_en: "KU" },
      transfer_candidate: [],
    } as any;

    it("returns candidate detail with full profile", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue(candidateData);

      const result = await getCandidateDetail(1);

      expect(result.candidate).not.toBeNull();
      expect(result.candidate?.candidate_id).toBe(1);
      expect(result.candidate?.candidate_name).toBe("John Doe");
      expect(result.candidate?.candidate_email).toBe("john@example.com");
      expect(result.candidate?.store?.store_name).toBe("Main Branch");
      expect(result.candidate?.country?.country_name_en).toBe("Kuwait");
      expect(result.candidate?.university?.university_name_en).toBe("KU");
    });

    it("returns empty arrays when candidate not found", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue(null);

      const result = await getCandidateDetail(999);

      expect(result.candidate).toBeNull();
      expect(result.placements).toHaveLength(0);
      expect(result.documents).toHaveLength(0);
      expect(result.metrics).toHaveLength(0);
    });

    it("throws error for invalid candidate ID (negative)", async () => {
      await expect(getCandidateDetail(-1)).rejects.toThrow();
    });

    it("returns documents based on available profile fields", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue(candidateData);

      const result = await getCandidateDetail(1);

      // Resume + Civil ID Front (back is null, personal photo is null)
      expect(result.documents).toHaveLength(2);
      expect(result.documents[0].type).toBe("resume");
      expect(result.documents[1].type).toBe("civil_id_front");
    });

    it("returns placements from transfer_candidate records", async () => {
      const candidateWithPlacements = {
        ...candidateData,
        transfer_candidate: [
          {
            tc_id: 10,
            store_name: "Store A",
            hours: 40,
            candidate_total: 500,
            paid: 1,
            transfer: {
              transfer_id: 100,
              start_date: new Date("2026-06-01"),
              end_date: new Date("2026-06-15"),
              company: { company_name: "Acme Corp" },
            },
          },
        ],
      } as any;

      vi.mocked(prisma.candidate.findFirst).mockResolvedValue(candidateWithPlacements);

      const result = await getCandidateDetail(1);

      expect(result.placements).toHaveLength(1);
      expect(result.placements[0].transfer_id).toBe(100);
      expect(result.placements[0].company_name).toBe("Acme Corp");
      expect(result.placements[0].hours).toBe(40);
      expect(result.placements[0].paid).toBe(1);
    });

    it("calls findFirst with deleted: 0 filter", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue(null);

      await getCandidateDetail(1);

      const where = vi.mocked(prisma.candidate.findFirst).mock.calls[0][0]?.where as any;
      expect(where.deleted).toBe(0);
      expect(where.candidate_id).toBe(1);
    });
  });

  // -----------------------------------------------------------------------
  // updateCandidateStatus
  // -----------------------------------------------------------------------

  describe("updateCandidateStatus", () => {
    it("updates candidate status to active (10)", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue({
        candidate_id: 1,
        candidate_status: 10,
      } as any);
      vi.mocked(prisma.candidate.update).mockResolvedValue({} as any);

      const result = await updateCandidateStatus({
        candidateId: 1,
        status: 10,
      });

      expect(result.operation).toBe("success");
      expect(result.message).toContain("Active");
      expect(vi.mocked(prisma.candidate.update).mock.calls[0][0]?.data).toMatchObject({
        candidate_status: 10,
      });
    });

    it("updates candidate status to inactive (20)", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue({
        candidate_id: 2,
        candidate_status: 10,
      } as any);
      vi.mocked(prisma.candidate.update).mockResolvedValue({} as any);

      const result = await updateCandidateStatus({
        candidateId: 2,
        status: 20,
      });

      expect(result.operation).toBe("success");
      expect(result.message).toContain("Inactive");
    });

    it("updates candidate status to banned (30)", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue({
        candidate_id: 3,
        candidate_status: 10,
      } as any);
      vi.mocked(prisma.candidate.update).mockResolvedValue({} as any);

      const result = await updateCandidateStatus({
        candidateId: 3,
        status: 30,
      });

      expect(result.operation).toBe("success");
      expect(result.message).toContain("Banned");
    });

    it("returns error for non-existent candidate", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue(null);

      const result = await updateCandidateStatus({
        candidateId: 999,
        status: 20,
      });

      expect(result.operation).toBe("error");
      expect(result.message).toBe("Candidate not found");
    });

    it("returns error for invalid status value", async () => {
      const result = await updateCandidateStatus({
        candidateId: 1,
        status: 99,
      } as any);

      expect(result.operation).toBe("error");
      expect(result.message).toBeDefined();
    });

    it("returns error for invalid candidate ID", async () => {
      const result = await updateCandidateStatus({
        candidateId: -1,
        status: 10,
      });

      expect(result.operation).toBe("error");
      expect(result.message).toBeDefined();
    });

    it("returns error on Prisma failure", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue({
        candidate_id: 1,
        candidate_status: 10,
      } as any);
      vi.mocked(prisma.candidate.update).mockRejectedValue(
        new Error("Deadlock"),
      );

      const result = await updateCandidateStatus({
        candidateId: 1,
        status: 20,
      });

      expect(result.operation).toBe("error");
      expect(result.message).toBe("Deadlock");
    });

    it("calls revalidatePath after status update", async () => {
      const { revalidatePath } = await import("next/cache");
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue({
        candidate_id: 1,
        candidate_status: 10,
      } as any);
      vi.mocked(prisma.candidate.update).mockResolvedValue({} as any);

      await updateCandidateStatus({ candidateId: 1, status: 20 });

      expect(revalidatePath).toHaveBeenCalledWith("/admin/candidates");
      expect(revalidatePath).toHaveBeenCalledWith("/admin/candidates/1");
    });
  });

  // -----------------------------------------------------------------------
  // updateCandidate
  // -----------------------------------------------------------------------

  describe("updateCandidate", () => {
    it("updates candidate profile fields", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue({
        candidate_id: 1,
      } as any);
      vi.mocked(prisma.candidate.update).mockResolvedValue({} as any);

      const result = await updateCandidate({
        candidateId: 1,
        candidateName: "Jane Doe",
        candidateEmail: "jane@example.com",
      });

      expect(result.operation).toBe("success");
      expect(result.message).toBe("Candidate updated successfully");

      const data = vi.mocked(prisma.candidate.update).mock.calls[0][0]?.data as any;
      expect(data.candidate_name).toBe("Jane Doe");
      expect(data.candidate_email).toBe("jane@example.com");
    });

    it("only includes provided fields", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue({
        candidate_id: 1,
      } as any);
      vi.mocked(prisma.candidate.update).mockResolvedValue({} as any);

      await updateCandidate({
        candidateId: 1,
        candidatePhone: "50000000",
      });

      const data = vi.mocked(prisma.candidate.update).mock.calls[0][0]?.data as any;
      expect(data.candidate_phone).toBe("50000000");
      expect(data.candidate_name).toBeUndefined();
      expect(data.candidate_email).toBeUndefined();
    });

    it("converts candidateBirthDate string to Date", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue({
        candidate_id: 1,
      } as any);
      vi.mocked(prisma.candidate.update).mockResolvedValue({} as any);

      await updateCandidate({
        candidateId: 1,
        candidateBirthDate: "1998-06-15",
      });

      const data = vi.mocked(prisma.candidate.update).mock.calls[0][0]?.data as any;
      expect(data.candidate_birth_date).toBeInstanceOf(Date);
    });

    it("returns error for non-existent candidate", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue(null);

      const result = await updateCandidate({
        candidateId: 999,
        candidateName: "Nope",
      });

      expect(result.operation).toBe("error");
      expect(result.message).toBe("Candidate not found");
    });

    it("returns error for invalid candidate ID", async () => {
      const result = await updateCandidate({
        candidateId: -1,
        candidateName: "Bad",
      });

      expect(result.operation).toBe("error");
      expect(result.message).toBeDefined();
    });

    it("returns error on Prisma failure", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue({
        candidate_id: 1,
      } as any);
      vi.mocked(prisma.candidate.update).mockRejectedValue(
        new Error("Unique constraint"),
      );

      const result = await updateCandidate({
        candidateId: 1,
        candidateName: "Collision",
      });

      expect(result.operation).toBe("error");
      expect(result.message).toBe("Unique constraint");
    });

    it("sets candidate_updated_at on every update", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue({
        candidate_id: 1,
      } as any);
      vi.mocked(prisma.candidate.update).mockResolvedValue({} as any);

      await updateCandidate({ candidateId: 1, candidateName: "Test" });

      const data = vi.mocked(prisma.candidate.update).mock.calls[0][0]?.data as any;
      expect(data.candidate_updated_at).toBeInstanceOf(Date);
    });

    it("calls revalidatePath after update", async () => {
      const { revalidatePath } = await import("next/cache");
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue({
        candidate_id: 1,
      } as any);
      vi.mocked(prisma.candidate.update).mockResolvedValue({} as any);

      await updateCandidate({ candidateId: 1, candidateName: "Updated" });

      expect(revalidatePath).toHaveBeenCalledWith("/admin/candidates");
      expect(revalidatePath).toHaveBeenCalledWith("/admin/candidates/1");
    });
  });

  // -----------------------------------------------------------------------
  // deleteCandidate
  // -----------------------------------------------------------------------

  describe("deleteCandidate", () => {
    it("soft-deletes a candidate", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue({
        candidate_id: 1,
      } as any);
      vi.mocked(prisma.candidate.update).mockResolvedValue({} as any);

      const result = await deleteCandidate({ candidateId: 1 });

      expect(result.operation).toBe("success");
      expect(result.message).toBe("Candidate deleted successfully");
      expect(vi.mocked(prisma.candidate.update).mock.calls[0][0]?.data).toMatchObject({
        deleted: 1,
      });
    });

    it("returns error for non-existent candidate", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue(null);

      const result = await deleteCandidate({ candidateId: 999 });

      expect(result.operation).toBe("error");
      expect(result.message).toBe("Candidate not found");
    });

    it("returns error for invalid candidate ID", async () => {
      const result = await deleteCandidate({ candidateId: -1 });

      expect(result.operation).toBe("error");
      expect(result.message).toBeDefined();
    });

    it("returns error on Prisma failure", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue({
        candidate_id: 1,
      } as any);
      vi.mocked(prisma.candidate.update).mockRejectedValue(
        new Error("Foreign key constraint"),
      );

      const result = await deleteCandidate({ candidateId: 1 });

      expect(result.operation).toBe("error");
      expect(result.message).toBe("Foreign key constraint");
    });

    it("calls revalidatePath after deletion", async () => {
      const { revalidatePath } = await import("next/cache");
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue({
        candidate_id: 1,
      } as any);
      vi.mocked(prisma.candidate.update).mockResolvedValue({} as any);

      await deleteCandidate({ candidateId: 1 });

      expect(revalidatePath).toHaveBeenCalledWith("/admin/candidates");
      expect(revalidatePath).toHaveBeenCalledWith("/admin/candidates/1");
    });

    it("sets candidate_updated_at on soft delete", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue({
        candidate_id: 1,
      } as any);
      vi.mocked(prisma.candidate.update).mockResolvedValue({} as any);

      await deleteCandidate({ candidateId: 1 });

      const data = vi.mocked(prisma.candidate.update).mock.calls[0][0]?.data as any;
      expect(data.candidate_updated_at).toBeInstanceOf(Date);
    });
  });
});
