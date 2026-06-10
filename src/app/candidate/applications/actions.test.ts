import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — data layer & auth
// ---------------------------------------------------------------------------

const mockFindMany = vi.fn();
const mockCount = vi.fn();
const mockFindFirst = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    job_listing_application: {
      findMany: mockFindMany,
      count: mockCount,
      findFirst: mockFindFirst,
      update: mockUpdate,
    },
  },
}));

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Must import after mocks are set up
const { requireRoleCapability } = await import("@/modules/auth/session");
const { listMyApplications, withdrawApplication } = await import("./actions");

const mockUser = {
  role: "candidate" as const,
  id: "1",
  name: "Test Candidate",
  email: "test@candidate.studenthub.local",
  issuedAt: Date.now(),
};

describe("Candidate Applications actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listMyApplications", () => {
    it("returns applications for authenticated candidate", async () => {
      vi.mocked(requireRoleCapability).mockResolvedValue(mockUser as any);
      mockFindMany.mockResolvedValue([
        {
          applicationId: 1,
          jobListingId: 10,
          status: "applied",
          coverLetter: null,
          createdAt: new Date("2026-06-01"),
          updatedAt: new Date("2026-06-01"),
          jobListing: {
            title: "Software Engineer",
            employer: { company_name: "Tech Corp" },
          },
        },
      ]);
      mockCount.mockResolvedValue(1);

      const result = await listMyApplications({});

      expect(result.total).toBe(1);
      expect(result.applications[0].jobTitle).toBe("Software Engineer");
      expect(result.applications[0].employerName).toBe("Tech Corp");
      expect(requireRoleCapability).toHaveBeenCalledWith("candidate", "candidate.read.own");
    });

    it("filters by status when provided", async () => {
      vi.mocked(requireRoleCapability).mockResolvedValue(mockUser as any);
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      await listMyApplications({ status: "withdrawn" });

      const whereArg = mockFindMany.mock.calls[0][0]?.where;
      expect(whereArg).toBeDefined();
    });

    it("returns empty list when no applications exist", async () => {
      vi.mocked(requireRoleCapability).mockResolvedValue(mockUser as any);
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      const result = await listMyApplications({});

      expect(result.applications).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it("supports pagination", async () => {
      vi.mocked(requireRoleCapability).mockResolvedValue(mockUser as any);
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      const result = await listMyApplications({ page: 2, limit: 10 });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
    });
  });

  describe("withdrawApplication", () => {
    it("withdraws the application when owned by candidate", async () => {
      vi.mocked(requireRoleCapability).mockResolvedValue(mockUser as any);
      mockFindFirst.mockResolvedValue({ applicationId: 1, candidateId: 1 });

      const result = await withdrawApplication(1);

      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { applicationId: 1 },
          data: { status: "withdrawn" },
        }),
      );
    });

    it("returns error when application not found", async () => {
      vi.mocked(requireRoleCapability).mockResolvedValue(mockUser as any);
      mockFindFirst.mockResolvedValue(null);

      const result = await withdrawApplication(999);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Application not found");
    });
  });
});
