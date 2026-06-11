import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — delegate to module actions (these now contain the real logic)
// ---------------------------------------------------------------------------

const mockModuleListApplications = vi.fn();
const mockModuleUpdateApplicationStatus = vi.fn();

vi.mock("@/modules/candidates/applications/actions", () => ({
  listApplications: mockModuleListApplications,
  updateApplicationStatus: mockModuleUpdateApplicationStatus,
}));

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Must import after mocks are set up
const { requireRoleCapability } = await import("@/modules/auth/session");
const { revalidatePath } = await import("next/cache");
const { listMyApplications, withdrawApplication } = await import("./actions");

// Import schemas directly (no mock dependency)
import {
  applicationItemSchema,
  listApplicationsResultSchema,
  withdrawApplicationResultSchema,
} from "./schemas";

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
    it("delegates to module listApplications with session candidateId", async () => {
      vi.mocked(requireRoleCapability).mockResolvedValue(mockUser as any);
      mockModuleListApplications.mockResolvedValue({
        items: [
          {
            applicationId: 1,
            jobListingId: 10,
            jobTitle: "Software Engineer",
            employerName: "Tech Corp",
            status: "applied",
            coverLetter: null,
            createdAt: new Date("2026-06-01"),
            updatedAt: new Date("2026-06-01"),
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
      });

      const result = await listMyApplications({});

      expect(mockModuleListApplications).toHaveBeenCalledWith({
        candidateId: 1,
        page: 1,
        limit: 20,
        status: undefined,
      });
      expect(result.total).toBe(1);
      expect(result.applications[0].jobTitle).toBe("Software Engineer");
      expect(result.applications[0].employerName).toBe("Tech Corp");
      expect(requireRoleCapability).toHaveBeenCalledWith("candidate", "candidate.read.own");
    });

    it("maps module shape { items, pageSize } → app router shape { applications, limit }", async () => {
      vi.mocked(requireRoleCapability).mockResolvedValue(mockUser as any);
      mockModuleListApplications.mockResolvedValue({
        items: [
          {
            applicationId: 1,
            jobListingId: 10,
            jobTitle: "Engineer",
            employerName: "Corp",
            status: "applied",
            coverLetter: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 1,
        page: 2,
        pageSize: 10,
      });

      const result = await listMyApplications({ page: 2, limit: 10 });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.applications).toHaveLength(1);
    });

    it("filters by status when provided", async () => {
      vi.mocked(requireRoleCapability).mockResolvedValue(mockUser as any);
      mockModuleListApplications.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20 });

      await listMyApplications({ status: "withdrawn" });

      expect(mockModuleListApplications).toHaveBeenCalledWith({
        candidateId: 1,
        page: 1,
        limit: 20,
        status: "withdrawn",
      });
    });

    it("returns empty list when module returns empty", async () => {
      vi.mocked(requireRoleCapability).mockResolvedValue(mockUser as any);
      mockModuleListApplications.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20 });

      const result = await listMyApplications({});

      expect(result.applications).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it("supports pagination", async () => {
      vi.mocked(requireRoleCapability).mockResolvedValue(mockUser as any);
      mockModuleListApplications.mockResolvedValue({ items: [], total: 0, page: 2, pageSize: 10 });

      const result = await listMyApplications({ page: 2, limit: 10 });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
    });
  });

  describe("withdrawApplication", () => {
    it("delegates to module updateApplicationStatus with status=withdrawn", async () => {
      vi.mocked(requireRoleCapability).mockResolvedValue(mockUser as any);
      mockModuleUpdateApplicationStatus.mockResolvedValue({
        success: true,
        applicationId: 1,
      });

      const result = await withdrawApplication(1);

      expect(result.success).toBe(true);
      expect(mockModuleUpdateApplicationStatus).toHaveBeenCalledWith({
        applicationId: 1,
        status: "withdrawn",
      });
      expect(revalidatePath).toHaveBeenCalledWith("/candidate/applications");
    });

    it("returns error when module returns failure", async () => {
      vi.mocked(requireRoleCapability).mockResolvedValue(mockUser as any);
      mockModuleUpdateApplicationStatus.mockResolvedValue({
        success: false,
        error: "Application not found",
      });

      const result = await withdrawApplication(999);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Application not found");
    });
  });
});

describe("Candidate Applications — Zod output schemas", () => {
  it("validates a valid ApplicationItem", () => {
    const item = {
      applicationId: 1,
      jobListingId: 10,
      jobTitle: "Software Engineer",
      employerName: "Tech Corp",
      status: "applied",
      coverLetter: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(applicationItemSchema.safeParse(item).success).toBe(true);
  });

  it("accepts a valid ApplicationItem with cover letter", () => {
    const item = {
      applicationId: 1,
      jobListingId: 10,
      jobTitle: "Software Engineer",
      employerName: "Tech Corp",
      status: "applied",
      coverLetter: "I am interested",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(applicationItemSchema.safeParse(item).success).toBe(true);
  });

  it("rejects an ApplicationItem missing required fields", () => {
    const item = {
      applicationId: 1,
      jobTitle: "Software Engineer",
    };
    expect(applicationItemSchema.safeParse(item).success).toBe(false);
  });

  it("rejects an ApplicationItem with wrong type for applicationId", () => {
    const item = {
      applicationId: "not-a-number",
      jobListingId: 10,
      jobTitle: "Software Engineer",
      employerName: "Tech Corp",
      status: "applied",
      coverLetter: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(applicationItemSchema.safeParse(item).success).toBe(false);
  });

  it("validates a valid ListApplicationsResult", () => {
    const data = {
      applications: [
        {
          applicationId: 1,
          jobListingId: 10,
          jobTitle: "Engineer",
          employerName: "Corp",
          status: "applied",
          coverLetter: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
    };
    expect(listApplicationsResultSchema.safeParse(data).success).toBe(true);
  });

  it("rejects ListApplicationsResult with wrong applications type", () => {
    const data = {
      applications: "not-an-array",
      total: 1,
      page: 1,
      limit: 20,
    };
    expect(listApplicationsResultSchema.safeParse(data).success).toBe(false);
  });

  it("validates a successful withdraw result", () => {
    expect(withdrawApplicationResultSchema.safeParse({ success: true }).success).toBe(true);
  });

  it("validates an error withdraw result", () => {
    expect(
      withdrawApplicationResultSchema.safeParse({ success: false, error: "Not found" }).success,
    ).toBe(true);
  });

  it("rejects an invalid withdraw result", () => {
    expect(withdrawApplicationResultSchema.safeParse({ success: "yes" }).success).toBe(false);
  });
});
