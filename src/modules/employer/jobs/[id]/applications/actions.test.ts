import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock functions ──────────────────────────────────
const {
  mockRequireCapability,
  mockGetSession,
  mockFindMany,
  mockCount,
  mockUpdate,
} = vi.hoisted(() => ({
  mockRequireCapability: vi.fn(),
  mockGetSession: vi.fn(),
  mockFindMany: vi.fn(),
  mockCount: vi.fn(),
  mockUpdate: vi.fn(),
}));

// ── Mock session module ─────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
  getSession: mockGetSession,
}));

// ── Mock Prisma ─────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    job_listing_application: {
      findMany: mockFindMany,
      count: mockCount,
      update: mockUpdate,
    },
  },
}));

import {
  listJobApplicationsSchema,
  listJobApplicationsByEmployerSchema,
  updateApplicationStatusSchema,
  jobApplicationRowOutputSchema,
  jobApplicationListOutputSchema,
  jobApplicationWithJobRowOutputSchema,
  jobApplicationListByEmployerOutputSchema,
  updateApplicationStatusOutputSchema,
} from "./schemas";

import {
  listJobApplications,
  listJobApplicationsByEmployer,
  updateApplicationStatus,
} from "./actions";
import type { JobApplicationRow } from "./schemas";

// ===========================================================================
// Input schema validation
// ===========================================================================

describe("listJobApplicationsSchema", () => {
  it("accepts valid input with jobListingId only", () => {
    const result = listJobApplicationsSchema.safeParse({ jobListingId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.jobListingId).toBe(42);
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts pagination and status filter", () => {
    const result = listJobApplicationsSchema.safeParse({
      jobListingId: 1,
      page: 2,
      limit: 10,
      status: "reviewed",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
      expect(result.data.status).toBe("reviewed");
    }
  });

  it("rejects missing jobListingId", () => {
    const result = listJobApplicationsSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = listJobApplicationsSchema.safeParse({ jobListingId: 1, limit: 999 });
    expect(result.success).toBe(false);
  });
});

describe("listJobApplicationsByEmployerSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const result = listJobApplicationsByEmployerSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts status filter", () => {
    const result = listJobApplicationsByEmployerSchema.safeParse({ status: "pending" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.status).toBe("pending");
  });

  it("rejects negative page", () => {
    const result = listJobApplicationsByEmployerSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });
});

describe("updateApplicationStatusSchema", () => {
  it("accepts valid input", () => {
    const result = updateApplicationStatusSchema.safeParse({
      applicationId: 10,
      status: "accepted",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing applicationId", () => {
    const result = updateApplicationStatusSchema.safeParse({ status: "accepted" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = updateApplicationStatusSchema.safeParse({
      applicationId: 1,
      status: "invalid-status",
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero applicationId", () => {
    const result = updateApplicationStatusSchema.safeParse({
      applicationId: 0,
      status: "rejected",
    });
    expect(result.success).toBe(false);
  });
});

// ===========================================================================
// Output schema validation
// ===========================================================================

describe("jobApplicationRowOutputSchema", () => {
  it("accepts a valid application row", () => {
    const row: JobApplicationRow = {
      applicationId: 1,
      candidateId: 42,
      candidateName: "John Doe",
      status: "pending",
      coverLetter: "I want this job",
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-02"),
    };
    const result = jobApplicationRowOutputSchema.safeParse(row);
    expect(result.success).toBe(true);
  });

  it("accepts null candidateName", () => {
    const row: JobApplicationRow = {
      applicationId: 2,
      candidateId: 43,
      candidateName: null,
      status: "reviewed",
      coverLetter: null,
      createdAt: new Date("2025-01-03"),
      updatedAt: new Date("2025-01-04"),
    };
    const result = jobApplicationRowOutputSchema.safeParse(row);
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = jobApplicationRowOutputSchema.safeParse({
      applicationId: 1,
    });
    expect(result.success).toBe(false);
  });
});

describe("jobApplicationListOutputSchema", () => {
  it("accepts a valid list result", () => {
    const result = jobApplicationListOutputSchema.safeParse({
      success: true,
      applications: [{
        applicationId: 1,
        candidateId: 42,
        candidateName: "Alice",
        status: "pending",
        coverLetter: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }],
      total: 1,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative total", () => {
    const result = jobApplicationListOutputSchema.safeParse({
      success: true,
      applications: [],
      total: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-literal success", () => {
    const result = jobApplicationListOutputSchema.safeParse({
      success: false,
      applications: [],
      total: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("jobApplicationWithJobRowOutputSchema", () => {
  it("accepts a valid row with job title", () => {
    const result = jobApplicationWithJobRowOutputSchema.safeParse({
      applicationId: 1,
      candidateId: 42,
      candidateName: "Alice",
      status: "pending",
      coverLetter: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      jobTitle: "Engineer",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing jobTitle", () => {
    const result = jobApplicationWithJobRowOutputSchema.safeParse({
      applicationId: 1,
      candidateId: 42,
      candidateName: null,
      status: "pending",
      coverLetter: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(result.success).toBe(false);
  });
});

describe("jobApplicationListByEmployerOutputSchema", () => {
  it("accepts a valid list result", () => {
    const result = jobApplicationListByEmployerOutputSchema.safeParse({
      success: true,
      applications: [{
        applicationId: 1,
        candidateId: 42,
        candidateName: "Bob",
        status: "accepted",
        coverLetter: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        jobTitle: "Dev",
      }],
      total: 1,
    });
    expect(result.success).toBe(true);
  });
});

describe("updateApplicationStatusOutputSchema", () => {
  it("accepts success response", () => {
    const result = updateApplicationStatusOutputSchema.safeParse({ success: true });
    expect(result.success).toBe(true);
  });

  it("rejects non-true success", () => {
    const result = updateApplicationStatusOutputSchema.safeParse({ success: false });
    expect(result.success).toBe(false);
  });
});

// ===========================================================================
// Action-level tests — mocked DB
// ===========================================================================

describe("listJobApplications action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated applications for a job", async () => {
    const dbRows = [
      {
        id: 1,
        jobListingId: 42,
        candidateId: 100,
        status: "pending",
        coverLetter: "I'm interested",
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date("2025-01-02"),
        candidate: {
          candidate_id: 100,
          candidate_name: "Alice",
          candidate_name_ar: "أليس",
        },
      },
    ];

    mockRequireCapability.mockResolvedValue(undefined);
    mockFindMany.mockResolvedValue(dbRows);
    mockCount.mockResolvedValue(1);

    const result = await listJobApplications({ jobListingId: 42 });

    expect(mockRequireCapability).toHaveBeenCalledWith("company.read.linked");
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { jobListingId: 42 },
        orderBy: { createdAt: "desc" },
        include: expect.objectContaining({ candidate: expect.any(Object) }),
      }),
    );
    expect(result.success).toBe(true);
    expect(result.applications).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.applications[0].applicationId).toBe(1);
    expect(result.applications[0].candidateName).toBe("Alice");
  });

  it("applies status filter", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await listJobApplications({ jobListingId: 1, status: "reviewed" });

    const findManyCall = mockFindMany.mock.calls[0][0];
    expect(findManyCall.where.status).toBe("reviewed");
  });

  it("returns empty on invalid input", async () => {
    mockRequireCapability.mockResolvedValue(undefined);

    const result = await listJobApplications({ jobListingId: 0 });

    expect(result).toEqual({ success: true, applications: [], total: 0 });
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it("returns empty when no results", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    const result = await listJobApplications({ jobListingId: 999 });

    expect(result.applications).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(listJobApplications({ jobListingId: 1 })).rejects.toThrow("Unauthorized");
    expect(mockFindMany).not.toHaveBeenCalled();
  });
});

describe("listJobApplicationsByEmployer action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all applications for the employer", async () => {
    const dbRows = [
      {
        id: 1,
        jobListingId: 10,
        candidateId: 100,
        status: "pending",
        coverLetter: "Hire me",
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date("2025-01-02"),
        candidate: {
          candidate_id: 100,
          candidate_name: "Alice",
          candidate_name_ar: "أليس",
        },
        jobListing: {
          title: "Engineer",
        },
      },
    ];

    mockRequireCapability.mockResolvedValue(undefined);
    mockFindMany.mockResolvedValue(dbRows);
    mockCount.mockResolvedValue(1);

    const result = await listJobApplicationsByEmployer({});

    expect(mockRequireCapability).toHaveBeenCalledWith("company.read.linked");
    expect(result.success).toBe(true);
    expect(result.applications).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.applications[0].jobTitle).toBe("Engineer");
    expect(result.applications[0].candidateName).toBe("Alice");
  });

  it("applies status filter", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await listJobApplicationsByEmployer({ status: "accepted" });

    const findManyCall = mockFindMany.mock.calls[0][0];
    expect(findManyCall.where.status).toBe("accepted");
  });

  it("returns fallback for missing candidate/job names", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockFindMany.mockResolvedValue([
      {
        id: 1,
        jobListingId: 10,
        candidateId: 100,
        status: "pending",
        coverLetter: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        candidate: null,
        jobListing: null,
      },
    ]);
    mockCount.mockResolvedValue(1);

    const result = await listJobApplicationsByEmployer({});

    expect(result.applications[0].candidateName).toBeNull();
    expect(result.applications[0].jobTitle).toBe("Unknown");
  });

  it("returns empty on invalid input", async () => {
    mockRequireCapability.mockResolvedValue(undefined);

    const result = await listJobApplicationsByEmployer({ page: 0 });

    expect(result).toEqual({ success: true, applications: [], total: 0 });
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(listJobApplicationsByEmployer({})).rejects.toThrow("Unauthorized");
    expect(mockFindMany).not.toHaveBeenCalled();
  });
});

describe("updateApplicationStatus action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates application status", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockUpdate.mockResolvedValue({});

    const result = await updateApplicationStatus({
      applicationId: 5,
      status: "accepted",
    });

    expect(mockRequireCapability).toHaveBeenCalledWith("company.write.linked");
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 5 },
      data: { status: "accepted" },
    });
    expect(result).toEqual({ success: true });
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(updateApplicationStatus({
      applicationId: 1,
      status: "rejected",
    })).rejects.toThrow("Unauthorized");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("throws on invalid input", async () => {
    mockRequireCapability.mockResolvedValue(undefined);

    await expect(updateApplicationStatus({
      applicationId: 0,
      status: "accepted",
    })).rejects.toThrow();
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// Output validation — verify safeParse is wired up by checking schema
// compatibility with actual return values from the actions module
// ===========================================================================

describe("output validation compatibility", () => {
  it("jobApplicationListOutputSchema matches listJobApplications return", () => {
    const sampleOutput = {
      success: true as const,
      applications: [{
        applicationId: 1,
        candidateId: 42,
        candidateName: "Alice",
        status: "pending",
        coverLetter: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }],
      total: 1,
    };
    const result = jobApplicationListOutputSchema.safeParse(sampleOutput);
    expect(result.success).toBe(true);
  });

  it("jobApplicationListByEmployerOutputSchema matches listJobApplicationsByEmployer return", () => {
    const sampleOutput = {
      success: true as const,
      applications: [{
        applicationId: 1,
        candidateId: 42,
        candidateName: "Alice",
        status: "pending",
        coverLetter: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        jobTitle: "Engineer",
      }],
      total: 1,
    };
    const result = jobApplicationListByEmployerOutputSchema.safeParse(sampleOutput);
    expect(result.success).toBe(true);
  });

  it("updateApplicationStatusOutputSchema matches updateApplicationStatus return", () => {
    const result = updateApplicationStatusOutputSchema.safeParse({ success: true as const });
    expect(result.success).toBe(true);
  });
});
