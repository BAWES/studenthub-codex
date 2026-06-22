import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listCandidateJobsSchema,
  getCandidateJobSchema,
  applyToJobSchema,
  listMyApplicationsSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Mock Prisma client
// ---------------------------------------------------------------------------

vi.mock("@/lib/prisma", () => ({
  prisma: {
    job_listing: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
    job_listing_application: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
  },
}));

// Auth mock — return a valid session
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
const mockRequireRoleCapability = vi.fn().mockResolvedValue({ id: "42" });
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: (...args: unknown[]) =>
    mockRequireRoleCapability(...args),
  requireCapability: vi.fn(),
  getSession: vi.fn().mockResolvedValue({ id: "42" }),
}));

import { prisma } from "@/lib/prisma";
import type { Mock } from "vitest";
import {
  listCandidateJobs,
  getCandidateJob,
  applyToJob,
  listMyApplications,
} from "./actions";

// ---------------------------------------------------------------------------
// listCandidateJobs
// ---------------------------------------------------------------------------

describe("listCandidateJobs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated job listings", async () => {
    const mockRows = [
      {
        jobListingId: 1,
        employerId: 10,
        title: "Software Engineer",
        description: "Build awesome things",
        requirements: null,
        location: "Kuwait City",
        employmentType: "full-time",
        salaryRange: "800-1200 KWD",
        status: "active",
        employer: { company_name: "TechCorp" },
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
      },
    ];

    (prisma.job_listing.findMany as Mock).mockResolvedValue(mockRows);
    (prisma.job_listing.count as Mock).mockResolvedValue(1);

    const { jobs, total } = await listCandidateJobs({ page: 1, limit: 20 });
    expect(jobs).toHaveLength(1);
    expect(jobs[0].title).toBe("Software Engineer");
    expect(jobs[0].employerName).toBe("TechCorp");
    expect(total).toBe(1);
  });

  it("filters by search query", async () => {
    (prisma.job_listing.findMany as Mock).mockResolvedValue([]);
    (prisma.job_listing.count as Mock).mockResolvedValue(0);

    await listCandidateJobs({ q: "engineer" });
    const callArgs = (prisma.job_listing.findMany as Mock).mock.calls[0][0];
    expect(callArgs.where.OR).toBeDefined();
  });

  it("returns empty array when no jobs exist", async () => {
    (prisma.job_listing.findMany as Mock).mockResolvedValue([]);
    (prisma.job_listing.count as Mock).mockResolvedValue(0);

    const { jobs, total } = await listCandidateJobs({ page: 1, limit: 20 });
    expect(jobs).toEqual([]);
    expect(total).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// getCandidateJob
// ---------------------------------------------------------------------------

describe("getCandidateJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a single job listing", async () => {
    const mockRow = {
      jobListingId: 1,
      employerId: 10,
      title: "Frontend Developer",
      description: "Build UIs",
      requirements: "React experience",
      location: "Remote",
      employmentType: "full-time",
      salaryRange: "1000-1500 KWD",
      status: "active",
      employer: { company_name: "WebCo" },
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    };

    (prisma.job_listing.findUnique as Mock).mockResolvedValue(mockRow);
    (prisma.job_listing_application.findFirst as Mock).mockResolvedValue(null);

    const { job } = await getCandidateJob({ jobId: 1 });
    expect(job.title).toBe("Frontend Developer");
    expect(job.employerName).toBe("WebCo");
    expect(job.requirements).toBe("React experience");
    expect(job.hasApplied).toBe(false);
  });

  it("throws when job not found", async () => {
    (prisma.job_listing.findUnique as Mock).mockResolvedValue(null);

    await expect(getCandidateJob({ jobId: 999 })).rejects.toThrow(
      "Job not found",
    );
  });

  it("throws when job is not active", async () => {
    (prisma.job_listing.findUnique as Mock).mockResolvedValue({
      jobListingId: 1,
      status: "closed",
      employer: { company_name: "WebCo" },
    });

    await expect(getCandidateJob({ jobId: 1 })).rejects.toThrow(
      "no longer accepting",
    );
  });
});

// ---------------------------------------------------------------------------
// applyToJob
// ---------------------------------------------------------------------------

describe("applyToJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a job application", async () => {
    (prisma.job_listing.findUnique as Mock).mockResolvedValue({
      jobListingId: 1,
      status: "active",
    });
    (prisma.job_listing_application.findFirst as Mock).mockResolvedValue(null);
    (prisma.job_listing_application.create as Mock).mockResolvedValue({
      id: 100,
    });

    const { applicationId, message } = await applyToJob({
      jobListingId: 1,
      coverLetter: "I love coding!",
    });
    expect(applicationId).toBe(100);
    expect(message).toContain("successfully");
  });

  it("throws when job does not exist", async () => {
    (prisma.job_listing.findUnique as Mock).mockResolvedValue(null);

    await expect(applyToJob({ jobListingId: 999 })).rejects.toThrow(
      "not found",
    );
  });

  it("throws when job is not active", async () => {
    (prisma.job_listing.findUnique as Mock).mockResolvedValue({
      jobListingId: 1,
      status: "closed",
    });

    await expect(applyToJob({ jobListingId: 1 })).rejects.toThrow("closed");
  });

  it("throws when already applied", async () => {
    (prisma.job_listing.findUnique as Mock).mockResolvedValue({
      jobListingId: 1,
      status: "active",
    });
    (prisma.job_listing_application.findFirst as Mock).mockResolvedValue({
      applicationId: 50,
    });

    await expect(applyToJob({ jobListingId: 1 })).rejects.toThrow(
      "already applied",
    );
  });
});

// ---------------------------------------------------------------------------
// listMyApplications
// ---------------------------------------------------------------------------

describe("listMyApplications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the candidate's applications", async () => {
    const mockApps = [
      {
        id: 1,
        jobListingId: 10,
        status: "applied",
        coverLetter: "I am interested",
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
        jobListing: {
          title: "Software Engineer",
          jobListingId: 10,
          employer: { company_name: "TechCorp" },
        },
      },
    ];

    (prisma.job_listing_application.findMany as Mock).mockResolvedValue(
      mockApps,
    );
    (prisma.job_listing_application.count as Mock).mockResolvedValue(1);

    const { applications, total } = await listMyApplications({
      page: 1,
      limit: 20,
    });
    expect(applications).toHaveLength(1);
    expect(total).toBe(1);
  });

  it("returns empty array when no applications", async () => {
    (prisma.job_listing_application.findMany as Mock).mockResolvedValue([]);
    (prisma.job_listing_application.count as Mock).mockResolvedValue(0);

    const { applications, total } = await listMyApplications({
      page: 1,
      limit: 20,
    });
    expect(applications).toEqual([]);
    expect(total).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Schema validation tests — pure unit, no mocking required
// ---------------------------------------------------------------------------

describe("listCandidateJobsSchema", () => {
  it("accepts empty params (defaults)", () => {
    const r = listCandidateJobsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const r = listCandidateJobsSchema.safeParse({ page: 2, limit: 10 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });

  it("coerces string page and limit", () => {
    const r = listCandidateJobsSchema.safeParse({ page: "3", limit: "50" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(3);
      expect(r.data.limit).toBe(50);
    }
  });

  it("rejects limit over 100", () => {
    expect(listCandidateJobsSchema.safeParse({ limit: 101 }).success).toBe(
      false,
    );
  });

  it("rejects limit below 1", () => {
    expect(listCandidateJobsSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listCandidateJobsSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("accepts optional search query", () => {
    const r = listCandidateJobsSchema.safeParse({ q: "software" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.q).toBe("software");
    }
  });

  it("accepts optional employment type filter", () => {
    const r = listCandidateJobsSchema.safeParse({
      employmentType: "full-time",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.employmentType).toBe("full-time");
    }
  });
});

describe("getCandidateJobSchema", () => {
  it("accepts a valid job ID", () => {
    const r = getCandidateJobSchema.safeParse({ jobId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.jobId).toBe(42);
    }
  });

  it("coerces string job ID to number", () => {
    const r = getCandidateJobSchema.safeParse({ jobId: "42" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.jobId).toBe(42);
    }
  });

  it("rejects missing job ID", () => {
    expect(getCandidateJobSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero job ID", () => {
    expect(getCandidateJobSchema.safeParse({ jobId: 0 }).success).toBe(false);
  });
});

describe("applyToJobSchema", () => {
  it("accepts job listing ID with cover letter", () => {
    const r = applyToJobSchema.safeParse({
      jobListingId: 42,
      coverLetter: "I am interested",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.jobListingId).toBe(42);
      expect(r.data.coverLetter).toBe("I am interested");
    }
  });

  it("accepts job listing ID only", () => {
    const r = applyToJobSchema.safeParse({ jobListingId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.jobListingId).toBe(42);
    }
  });

  it("rejects missing job listing ID", () => {
    expect(applyToJobSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero job listing ID", () => {
    expect(applyToJobSchema.safeParse({ jobListingId: 0 }).success).toBe(false);
  });
});

describe("listMyApplicationsSchema", () => {
  it("accepts empty params (defaults)", () => {
    const r = listMyApplicationsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts pagination", () => {
    const r = listMyApplicationsSchema.safeParse({ page: 2, limit: 10 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });

  it("rejects limit over 100", () => {
    expect(listMyApplicationsSchema.safeParse({ limit: 101 }).success).toBe(
      false,
    );
  });

  it("accepts optional status filter", () => {
    const r = listMyApplicationsSchema.safeParse({ status: "reviewing" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.status).toBe("reviewing");
    }
  });
});
