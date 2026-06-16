import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  employerDashboardMetricSchema,
  recentApplicationSchema,
  jobStatusBreakdownSchema,
  employerDashboardDataSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Mock Prisma
// ---------------------------------------------------------------------------
vi.mock("@/lib/prisma", () => ({
  prisma: {
    company_contact: {
      findFirst: vi.fn(),
    },
    job_listing: {
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    job_listing_application: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

// ---------------------------------------------------------------------------
// Mock session
// ---------------------------------------------------------------------------
vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn(),
  getSession: vi.fn(),
}));

const { prisma } = await import("@/lib/prisma");
const auth = await import("@/modules/auth/session");

// Import the module under test
const mod = await import("./actions");

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockSession = { id: "contact_uuid_123", companyId: 1 } as any;
const mockContactLink = {
  company: { company_id: 42 },
} as any;

const mockJobStatusRows = [
  { status: "active", _count: { status: 2 } },
  { status: "draft", _count: { status: 1 } },
  { status: "closed", _count: { status: 1 } },
] as any;

const mockRecentAppRows = [
  {
    id: 101,
    candidateId: 201,
    candidate: {
      candidate_id: 201,
      candidate_name: "Ahmed Al-Sabah",
      candidate_name_ar: null,
    },
    jobListing: { title: "Software Engineer", jobListingId: 301 },
    status: "pending",
    createdAt: new Date("2026-06-13T10:00:00Z"),
  },
  {
    id: 102,
    candidateId: 202,
    candidate: null,
    jobListing: { title: "UX Designer", jobListingId: 302 },
    status: "reviewed",
    createdAt: new Date("2026-06-12T14:00:00Z"),
  },
] as any;

// ---------------------------------------------------------------------------
// getEmployerDashboardData
// ---------------------------------------------------------------------------

describe("getEmployerDashboardData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns full dashboard data for a logged-in employer", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(undefined as any);
    vi.mocked(auth.getSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.company_contact.findFirst).mockResolvedValue(mockContactLink);
    vi.mocked(prisma.job_listing.count).mockResolvedValueOnce(4);  // totalJobs
    vi.mocked(prisma.job_listing.count).mockResolvedValueOnce(2);  // activeJobs
    vi.mocked(prisma.job_listing_application.count).mockResolvedValueOnce(10);  // totalApplications
    vi.mocked(prisma.job_listing_application.count).mockResolvedValueOnce(3);  // newApplications30d
    vi.mocked(prisma.job_listing_application.count).mockResolvedValueOnce(5);  // pendingReviews
    vi.mocked(prisma.job_listing.groupBy).mockResolvedValue(mockJobStatusRows);
    vi.mocked(prisma.job_listing_application.findMany).mockResolvedValue(mockRecentAppRows);

    const result = await mod.getEmployerDashboardData();

    expect(result.totalJobs).toBe(4);
    expect(result.totalApplications).toBe(10);
    expect(result.pendingReviews).toBe(5);
    expect(result.metrics).toHaveLength(4);
    expect(result.metrics[0].label).toBe("Active Job Listings");
    expect(result.metrics[0].value).toBe(2);
    expect(result.metrics[1].label).toBe("Total Applications");
    expect(result.metrics[1].value).toBe(10);
    expect(result.metrics[2].label).toBe("Pending Reviews");
    expect(result.metrics[2].value).toBe(5);
    expect(result.metrics[3].label).toBe("New Applications (30d)");
    expect(result.metrics[3].value).toBe(3);
    expect(result.jobStatusBreakdown).toHaveLength(3);
    expect(result.recentApplications).toHaveLength(2);

    expect(auth.requireCapability).toHaveBeenCalledWith("company.read.linked");
    expect(auth.getSession).toHaveBeenCalledOnce();
    expect(prisma.company_contact.findFirst).toHaveBeenCalledWith({
      where: { contact_uuid: "contact_uuid_123" },
      select: { company: { select: { company_id: true } } },
    });
  });

  it("returns empty defaults when session is null", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(undefined as any);
    vi.mocked(auth.getSession).mockResolvedValue(null as any);

    const result = await mod.getEmployerDashboardData();

    expect(result.totalJobs).toBe(0);
    expect(result.totalApplications).toBe(0);
    expect(result.metrics).toHaveLength(0);
    expect(result.recentApplications).toHaveLength(0);
    expect(result.jobStatusBreakdown).toHaveLength(0);
    expect(prisma.company_contact.findFirst).not.toHaveBeenCalled();
  });

  it("returns empty defaults when employer has no company link", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(undefined as any);
    vi.mocked(auth.getSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.company_contact.findFirst).mockResolvedValue(null as any); // No company link

    const result = await mod.getEmployerDashboardData();

    expect(result.totalJobs).toBe(0);
    expect(result.totalApplications).toBe(0);
    expect(result.metrics).toHaveLength(0);
    expect(prisma.job_listing.count).not.toHaveBeenCalled();
  });

  it("handles zero jobs and applications gracefully", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(undefined as any);
    vi.mocked(auth.getSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.company_contact.findFirst).mockResolvedValue(mockContactLink);
    vi.mocked(prisma.job_listing.count).mockResolvedValueOnce(0);  // totalJobs
    vi.mocked(prisma.job_listing.count).mockResolvedValueOnce(0);  // activeJobs
    vi.mocked(prisma.job_listing_application.count).mockResolvedValueOnce(0);  // totalApplications
    vi.mocked(prisma.job_listing_application.count).mockResolvedValueOnce(0);  // newApplications30d
    vi.mocked(prisma.job_listing_application.count).mockResolvedValueOnce(0);  // pendingReviews
    vi.mocked(prisma.job_listing.groupBy).mockResolvedValue([]);
    vi.mocked(prisma.job_listing_application.findMany).mockResolvedValue([]);

    const result = await mod.getEmployerDashboardData();

    expect(result.totalJobs).toBe(0);
    expect(result.totalApplications).toBe(0);
    expect(result.pendingReviews).toBe(0);
    expect(result.metrics).toHaveLength(4);
    expect(result.metrics[0].value).toBe(0);
    expect(result.metrics[1].value).toBe(0);
    expect(result.metrics[2].value).toBe(0);
    expect(result.metrics[3].value).toBe(0);
    expect(result.recentApplications).toHaveLength(0);
    expect(result.jobStatusBreakdown).toHaveLength(0);
  });

  it("returns recent applications with proper candidate name fallback", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(undefined as any);
    vi.mocked(auth.getSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.company_contact.findFirst).mockResolvedValue(mockContactLink);
    vi.mocked(prisma.job_listing.count).mockResolvedValueOnce(4);
    vi.mocked(prisma.job_listing.count).mockResolvedValueOnce(2);
    vi.mocked(prisma.job_listing_application.count).mockResolvedValueOnce(10);
    vi.mocked(prisma.job_listing_application.count).mockResolvedValueOnce(3);
    vi.mocked(prisma.job_listing_application.count).mockResolvedValueOnce(5);  // pendingReviews
    vi.mocked(prisma.job_listing.groupBy).mockResolvedValue(mockJobStatusRows);
    vi.mocked(prisma.job_listing_application.findMany).mockResolvedValue(mockRecentAppRows);

    const result = await mod.getEmployerDashboardData();

    expect(result.recentApplications[0].candidateName).toBe("Ahmed Al-Sabah");
    expect(result.recentApplications[1].candidateName).toBeNull();
    expect(result.recentApplications[0].applicationId).toBe(101);
    expect(result.recentApplications[0].jobTitle).toBe("Software Engineer");
  });

  it("uses Arabic name fallback when English name is null", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(undefined as any);
    vi.mocked(auth.getSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.company_contact.findFirst).mockResolvedValue(mockContactLink);
    vi.mocked(prisma.job_listing.count).mockResolvedValueOnce(4);
    vi.mocked(prisma.job_listing.count).mockResolvedValueOnce(2);
    vi.mocked(prisma.job_listing_application.count).mockResolvedValueOnce(10);
    vi.mocked(prisma.job_listing_application.count).mockResolvedValueOnce(3);
    vi.mocked(prisma.job_listing_application.count).mockResolvedValueOnce(1);  // pendingReviews
    vi.mocked(prisma.job_listing.groupBy).mockResolvedValue(mockJobStatusRows);
    vi.mocked(prisma.job_listing_application.findMany).mockResolvedValue([
      {
        id: 201,
        candidateId: 301,
        candidate: {
          candidate_id: 301,
          candidate_name: null,
          candidate_name_ar: "أحمد الصباح",
        },
        jobListing: { title: "مهندس برمجيات", jobListingId: 401 },
        status: "pending",
        createdAt: new Date("2026-06-13T10:00:00Z"),
      },
    ] as any);

    const result = await mod.getEmployerDashboardData();

    expect(result.recentApplications[0].candidateName).toBe("أحمد الصباح");
  });

  it("runs 7 parallel queries via Promise.all", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(undefined as any);
    vi.mocked(auth.getSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.company_contact.findFirst).mockResolvedValue(mockContactLink);
    vi.mocked(prisma.job_listing.count).mockResolvedValueOnce(4);
    vi.mocked(prisma.job_listing.count).mockResolvedValueOnce(2);
    vi.mocked(prisma.job_listing_application.count).mockResolvedValueOnce(10);
    vi.mocked(prisma.job_listing_application.count).mockResolvedValueOnce(3);
    vi.mocked(prisma.job_listing_application.count).mockResolvedValueOnce(5);  // pendingReviews
    vi.mocked(prisma.job_listing.groupBy).mockResolvedValue(mockJobStatusRows);
    vi.mocked(prisma.job_listing_application.findMany).mockResolvedValue(mockRecentAppRows);

    await mod.getEmployerDashboardData();

    // Verify all 7 prisma calls were made with correct parameters
    expect(prisma.job_listing.count).toHaveBeenCalledWith({ where: { employerId: 42 } });
    expect(prisma.job_listing.count).toHaveBeenCalledWith({ where: { employerId: 42, status: "active" } });
    expect(prisma.job_listing_application.count).toHaveBeenCalledWith({
      where: { jobListing: { employerId: 42 } },
    });
    expect(prisma.job_listing_application.count).toHaveBeenCalledWith({
      where: {
        jobListing: { employerId: 42 },
        createdAt: { gte: expect.any(Date) },
      },
    });
    expect(prisma.job_listing_application.count).toHaveBeenCalledWith({
      where: {
        jobListing: { employerId: 42 },
        status: { in: ["reviewing", "shortlisted"] },
      },
    });
    expect(prisma.job_listing.groupBy).toHaveBeenCalledWith({
      by: ["status"],
      where: { employerId: 42 },
      _count: { status: true },
    });
    expect(prisma.job_listing_application.findMany).toHaveBeenCalledWith({
      where: { jobListing: { employerId: 42 } },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        jobListing: { select: { title: true, jobListingId: true } },
        candidate: { select: { candidate_id: true, candidate_name: true, candidate_name_ar: true } },
      },
    });
  });
});

// ---------------------------------------------------------------------------
// Output schema validation
// ---------------------------------------------------------------------------

describe("employerDashboardMetricSchema", () => {
  it("validates a complete metric", () => {
    expect(
      employerDashboardMetricSchema.safeParse({
        label: "Active Job Listings",
        value: 5,
        note: "10 total job postings",
      }).success,
    ).toBe(true);
  });

  it("rejects missing value", () => {
    expect(
      employerDashboardMetricSchema.safeParse({
        label: "Test",
        note: "Note",
      }).success,
    ).toBe(false);
  });
});

describe("recentApplicationSchema", () => {
  it("validates a complete recent application", () => {
    expect(
      recentApplicationSchema.safeParse({
        applicationId: 101,
        candidateId: 201,
        candidateName: "Ahmed Al-Sabah",
        jobTitle: "Software Engineer",
        jobListingId: 301,
        status: "pending",
        createdAt: new Date(),
      }).success,
    ).toBe(true);
  });

  it("accepts null candidateName", () => {
    expect(
      recentApplicationSchema.safeParse({
        applicationId: 101,
        candidateId: 201,
        candidateName: null,
        jobTitle: "Software Engineer",
        jobListingId: 301,
        status: "pending",
        createdAt: new Date(),
      }).success,
    ).toBe(true);
  });
});

describe("jobStatusBreakdownSchema", () => {
  it("validates a status breakdown entry", () => {
    expect(
      jobStatusBreakdownSchema.safeParse({ status: "active", count: 2 }).success,
    ).toBe(true);
  });
});

describe("employerDashboardDataSchema", () => {
  it("validates full dashboard data", () => {
    const data = {
      metrics: [{ label: "Active Jobs", value: 5, note: "Note" }],
      recentApplications: [
        {
          applicationId: 1,
          candidateId: 1,
          candidateName: "Test",
          jobTitle: "Engineer",
          jobListingId: 1,
          status: "pending",
          createdAt: new Date(),
        },
      ],
      jobStatusBreakdown: [{ status: "active", count: 2 }],
      totalJobs: 5,
      totalApplications: 10,
      pendingReviews: 2,
    };
    expect(employerDashboardDataSchema.safeParse(data).success).toBe(true);
  });

  it("accepts empty arrays", () => {
    const data = {
      metrics: [],
      recentApplications: [],
      jobStatusBreakdown: [],
      totalJobs: 0,
      totalApplications: 0,
      pendingReviews: 0,
    };
    expect(employerDashboardDataSchema.safeParse(data).success).toBe(true);
  });

  it("rejects missing totalJobs", () => {
    expect(
      employerDashboardDataSchema.safeParse({
        metrics: [],
        recentApplications: [],
        jobStatusBreakdown: [],
        totalApplications: 0,
      }).success,
    ).toBe(false);
  });
});
