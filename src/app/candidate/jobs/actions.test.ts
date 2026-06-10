import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

// -----------------------------------------------------------------------
// Mock Prisma — all server actions use prisma.job_listing / job_listing_application
// -----------------------------------------------------------------------
vi.mock("@/lib/prisma", () => ({
  prisma: {
    job_listing: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
    job_listing_application: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
  },
}));

// Mock session — returns a fake candidate session
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn(() =>
    Promise.resolve({ id: "42", role: "candidate" }),
  ),
}));

// Mock next/cache revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// -----------------------------------------------------------------------
// List candidate jobs
// -----------------------------------------------------------------------
import { listCandidateJobs } from "./actions";

describe("listCandidateJobs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated active jobs with employer name", async () => {
    const mockJobs = [
      {
        jobListingId: 1,
        title: "Software Engineer Intern",
        description: "Great opportunity",
        requirements: null,
        location: "Kuwait City",
        employmentType: "internship",
        salaryRange: "300 KWD/mo",
        createdAt: new Date("2026-06-01"),
        employer: { company_name: "TechCo" },
      },
    ];

    vi.mocked(prisma.job_listing.findMany).mockResolvedValue(mockJobs);
    vi.mocked(prisma.job_listing.count).mockResolvedValue(1);

    const result = await listCandidateJobs({ limit: 20 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].employerName).toBe("TechCo");
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(prisma.job_listing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: "active" }),
        orderBy: { createdAt: "desc" },
      }),
    );
  });

  it("filters by employment type", async () => {
    vi.mocked(prisma.job_listing.findMany).mockResolvedValue([]);
    vi.mocked(prisma.job_listing.count).mockResolvedValue(0);

    await listCandidateJobs({ employmentType: "full-time" });

    expect(prisma.job_listing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ employmentType: "full-time" }),
      }),
    );
  });

  it("filters by search query across title and description", async () => {
    vi.mocked(prisma.job_listing.findMany).mockResolvedValue([]);
    vi.mocked(prisma.job_listing.count).mockResolvedValue(0);

    await listCandidateJobs({ q: "engineer" });

    const callArgs = vi.mocked(prisma.job_listing.findMany).mock.calls[0][0];
    expect(callArgs!.where).toMatchObject({
      OR: expect.arrayContaining([
        expect.objectContaining({ title: { contains: "engineer" } }),
      ]),
    });
  });

  it("returns empty result for invalid input", async () => {
    const result = await listCandidateJobs({ page: -1 } as any);

    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(prisma.job_listing.findMany).not.toHaveBeenCalled();
  });
});

// -----------------------------------------------------------------------
// Get single candidate job
// -----------------------------------------------------------------------
import { getCandidateJob } from "./actions";

describe("getCandidateJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a job listing by id", async () => {
    const mockJob = {
      jobListingId: 1,
      title: "Software Engineer",
      description: "Job description",
      requirements: null,
      location: "Kuwait",
      employmentType: "full-time",
      salaryRange: "500 KWD",
      createdAt: new Date(),
      employer: { company_name: "TechCo" },
    };

    vi.mocked(prisma.job_listing.findFirst).mockResolvedValue(mockJob);

    const result = await getCandidateJob({ jobId: 1 });

    expect(result).not.toBeNull();
    expect(result!.title).toBe("Software Engineer");
    expect(result!.employerName).toBe("TechCo");
  });

  it("returns null when job not found", async () => {
    vi.mocked(prisma.job_listing.findFirst).mockResolvedValue(null);

    const result = await getCandidateJob({ jobId: 999 });

    expect(result).toBeNull();
  });
});

// -----------------------------------------------------------------------
// Apply to job
// -----------------------------------------------------------------------
import { applyToJob } from "./actions";

describe("applyToJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an application successfully", async () => {
    vi.mocked(prisma.job_listing.findUnique).mockResolvedValue({
      jobListingId: 1,
      status: "active",
    });
    vi.mocked(prisma.job_listing_application.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.job_listing_application.create).mockResolvedValue({
      applicationId: 101,
    } as any);

    const result = await applyToJob({ jobId: 1 });

    expect(result.success).toBe(true);
    expect(result.applicationId).toBe(101);
    expect(result.alreadyApplied).toBe(false);
    expect(prisma.job_listing_application.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          jobListingId: 1,
          candidateId: 42,
          status: "new",
        }),
      }),
    );
  });

  it("returns alreadyApplied when candidate already applied", async () => {
    vi.mocked(prisma.job_listing.findUnique).mockResolvedValue({
      jobListingId: 1,
      status: "active",
    });
    vi.mocked(prisma.job_listing_application.findFirst).mockResolvedValue({
      applicationId: 50,
    } as any);

    const result = await applyToJob({ jobId: 1 });

    expect(result.success).toBe(true);
    expect(result.alreadyApplied).toBe(true);
    expect(result.applicationId).toBe(50);
    expect(prisma.job_listing_application.create).not.toHaveBeenCalled();
  });

  it("throws when job is not active", async () => {
    vi.mocked(prisma.job_listing.findUnique).mockResolvedValue({
      jobListingId: 1,
      status: "closed",
    });

    await expect(applyToJob({ jobId: 1 })).rejects.toThrow(
      "no longer accepting applications",
    );
  });

  it("throws when job does not exist", async () => {
    vi.mocked(prisma.job_listing.findUnique).mockResolvedValue(null);

    await expect(applyToJob({ jobId: 999 })).rejects.toThrow("Job not found");
  });
});

// -----------------------------------------------------------------------
// List my applications
// -----------------------------------------------------------------------
import { listMyApplications } from "./actions";

describe("listMyApplications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated applications with job details", async () => {
    const mockApplications = [
      {
        applicationId: 1,
        jobListingId: 1,
        status: "new",
        coverLetter: null,
        createdAt: new Date(),
        jobListing: {
          title: "Software Engineer",
          location: "Kuwait",
          employmentType: "full-time",
          salaryRange: "500 KWD",
          employer: { company_name: "TechCo" },
        },
      },
    ];

    vi.mocked(prisma.job_listing_application.findMany).mockResolvedValue(
      mockApplications as any,
    );
    vi.mocked(prisma.job_listing_application.count).mockResolvedValue(1);

    const result = await listMyApplications({ limit: 20 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].jobTitle).toBe("Software Engineer");
    expect(result.items[0].employerName).toBe("TechCo");
    expect(result.total).toBe(1);
  });

  it("returns empty list when no applications", async () => {
    vi.mocked(prisma.job_listing_application.findMany).mockResolvedValue([]);
    vi.mocked(prisma.job_listing_application.count).mockResolvedValue(0);

    const result = await listMyApplications({ limit: 20 });

    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});
