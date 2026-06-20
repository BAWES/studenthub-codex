import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listJobApplicationsSchema,
  listJobApplicationsByEmployerSchema,
  updateApplicationStatusSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests — pure unit, no mocking required
// ---------------------------------------------------------------------------

describe("listJobApplicationsSchema", () => {
  it("accepts valid input with all fields", () => {
    const r = listJobApplicationsSchema.safeParse({
      jobListingId: 42,
      page: 2,
      limit: 10,
      status: "applied",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.jobListingId).toBe(42);
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
      expect(r.data.status).toBe("applied");
    }
  });

  it("accepts minimal input with defaults", () => {
    const r = listJobApplicationsSchema.safeParse({
      jobListingId: 1,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("coerces string jobListingId to number", () => {
    const r = listJobApplicationsSchema.safeParse({
      jobListingId: "99",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.jobListingId).toBe(99);
    }
  });

  it("rejects missing jobListingId", () => {
    expect(listJobApplicationsSchema.safeParse({}).success).toBe(false);
  });

  it("rejects negative jobListingId", () => {
    expect(listJobApplicationsSchema.safeParse({ jobListingId: -1 }).success).toBe(false);
  });

  it("rejects zero jobListingId", () => {
    expect(listJobApplicationsSchema.safeParse({ jobListingId: 0 }).success).toBe(false);
  });

  it("rejects limit over 100", () => {
    expect(
      listJobApplicationsSchema.safeParse({ jobListingId: 1, limit: 101 }).success,
    ).toBe(false);
  });

  it("rejects limit below 1", () => {
    expect(
      listJobApplicationsSchema.safeParse({ jobListingId: 1, limit: 0 }).success,
    ).toBe(false);
  });

  it("rejects page below 1", () => {
    expect(
      listJobApplicationsSchema.safeParse({ jobListingId: 1, page: 0 }).success,
    ).toBe(false);
  });
});

describe("listJobApplicationsByEmployerSchema", () => {
  it("accepts empty input with defaults", () => {
    const r = listJobApplicationsByEmployerSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const r = listJobApplicationsByEmployerSchema.safeParse({
      page: 3,
      limit: 50,
      status: "shortlisted",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(3);
      expect(r.data.limit).toBe(50);
      expect(r.data.status).toBe("shortlisted");
    }
  });

  it("coerces string page and limit", () => {
    const r = listJobApplicationsByEmployerSchema.safeParse({
      page: "2",
      limit: "10",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });

  it("rejects limit over 100", () => {
    expect(listJobApplicationsByEmployerSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects limit below 1", () => {
    expect(listJobApplicationsByEmployerSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects page below 1", () => {
    expect(listJobApplicationsByEmployerSchema.safeParse({ page: 0 }).success).toBe(false);
  });
});

describe("updateApplicationStatusSchema", () => {
  it("accepts valid input", () => {
    const r = updateApplicationStatusSchema.safeParse({
      applicationId: 42,
      status: "accepted",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.applicationId).toBe(42);
      expect(r.data.status).toBe("accepted");
    }
  });

  it("accepts all valid status values", () => {
    for (const status of ["applied", "reviewing", "shortlisted", "interviewed", "accepted", "rejected"]) {
      const r = updateApplicationStatusSchema.safeParse({
        applicationId: 1,
        status,
      });
      expect(r.success).toBe(true);
    }
  });

  it("coerces string applicationId to number", () => {
    const r = updateApplicationStatusSchema.safeParse({
      applicationId: "7",
      status: "reviewing",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.applicationId).toBe(7);
    }
  });

  it("rejects missing applicationId", () => {
    expect(
      updateApplicationStatusSchema.safeParse({ status: "applied" }).success,
    ).toBe(false);
  });

  it("rejects zero applicationId", () => {
    expect(
      updateApplicationStatusSchema.safeParse({ applicationId: 0, status: "applied" }).success,
    ).toBe(false);
  });

  it("rejects negative applicationId", () => {
    expect(
      updateApplicationStatusSchema.safeParse({ applicationId: -1, status: "applied" }).success,
    ).toBe(false);
  });

  it("rejects invalid status value", () => {
    expect(
      updateApplicationStatusSchema.safeParse({
        applicationId: 1,
        status: "invalid_status",
      }).success,
    ).toBe(false);
  });

  it("rejects missing status", () => {
    expect(
      updateApplicationStatusSchema.safeParse({ applicationId: 1 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Action tests — mock Prisma + auth
// ---------------------------------------------------------------------------

const mockFindMany = vi.fn();
const mockCount = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    job_listing_application: {
      findMany: mockFindMany,
      count: mockCount,
      update: mockUpdate,
    },
  },
}));

vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn(),
}));

const { requireCapability } = await import("@/modules/auth/session");
const { prisma } = await import("@/lib/prisma");
const actions = await import("./actions");

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// listJobApplications
// ---------------------------------------------------------------------------

describe("listJobApplications", () => {
  it("returns applications for a job listing", async () => {
    const dbRow = {
      id: 1,
      applicationId: 1,
      jobListingId: 42,
      candidateId: 100,
      status: "applied",
      coverLetter: "I am interested!",
      createdAt: new Date("2026-06-10"),
      updatedAt: new Date("2026-06-10"),
      candidate: {
        candidate_id: 100,
        candidate_name: "Ahmed Al-Sabah",
        candidate_name_ar: null,
      },
    };
    mockFindMany.mockResolvedValue([dbRow]);
    mockCount.mockResolvedValue(1);

    const result = await actions.listJobApplications({
      jobListingId: 42,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.applications).toHaveLength(1);
      expect(result.applications[0].applicationId).toBe(1);
      expect(result.applications[0].candidateName).toBe("Ahmed Al-Sabah");
      expect(result.total).toBe(1);
    }
    expect(requireCapability).toHaveBeenCalledWith("company.read.linked");
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { jobListingId: 42 },
        skip: 0,
        take: 20,
      }),
    );
  });

  it("filters by status when provided", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await actions.listJobApplications({
      jobListingId: 42,
      status: "shortlisted",
    });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { jobListingId: 42, status: "shortlisted" },
      }),
    );
  });

  it("applies pagination correctly", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await actions.listJobApplications({
      jobListingId: 42,
      page: 3,
      limit: 10,
    });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 10,
      }),
    );
  });

  it("handles missing candidate name gracefully", async () => {
    const dbRow = {
      id: 2,
      applicationId: 2,
      jobListingId: 42,
      candidateId: 101,
      status: "applied",
      coverLetter: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      candidate: null,
    };
    mockFindMany.mockResolvedValue([dbRow]);
    mockCount.mockResolvedValue(1);

    const result = await actions.listJobApplications({ jobListingId: 42 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.applications[0].candidateName).toBeNull();
    }
  });

  it("falls back to candidate_name_ar when candidate_name is null", async () => {
    const dbRow = {
      id: 3,
      applicationId: 3,
      jobListingId: 42,
      candidateId: 102,
      status: "applied",
      coverLetter: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      candidate: {
        candidate_id: 102,
        candidate_name: null,
        candidate_name_ar: "أحمد السابح",
      },
    };
    mockFindMany.mockResolvedValue([dbRow]);
    mockCount.mockResolvedValue(1);

    const result = await actions.listJobApplications({ jobListingId: 42 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.applications[0].candidateName).toBe("أحمد السابح");
    }
  });

  it("prefers candidate_name over candidate_name_ar when both exist", async () => {
    const dbRow = {
      id: 4,
      applicationId: 4,
      jobListingId: 42,
      candidateId: 103,
      status: "applied",
      coverLetter: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      candidate: {
        candidate_id: 103,
        candidate_name: "Ahmed",
        candidate_name_ar: "أحمد",
      },
    };
    mockFindMany.mockResolvedValue([dbRow]);
    mockCount.mockResolvedValue(1);

    const result = await actions.listJobApplications({ jobListingId: 42 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.applications[0].candidateName).toBe("Ahmed");
    }
  });

  it("orders results by createdAt descending", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await actions.listJobApplications({ jobListingId: 42 });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: "desc" } }),
    );
  });

  it("returns empty array when no applications exist", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    const result = await actions.listJobApplications({ jobListingId: 999 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.applications).toEqual([]);
      expect(result.total).toBe(0);
    }
  });
});

// ---------------------------------------------------------------------------
// listJobApplicationsByEmployer
// ---------------------------------------------------------------------------

describe("listJobApplicationsByEmployer", () => {
  it("returns all applications across jobs", async () => {
    const dbRow = {
      id: 1,
      jobListingId: 42,
      candidateId: 100,
      status: "applied",
      coverLetter: "Hire me!",
      createdAt: new Date("2026-06-10"),
      updatedAt: new Date("2026-06-10"),
      jobListing: { title: "Software Engineer" },
      candidate: {
        candidate_id: 100,
        candidate_name: "Fatima",
        candidate_name_ar: null,
      },
    };
    mockFindMany.mockResolvedValue([dbRow]);
    mockCount.mockResolvedValue(1);

    const result = await actions.listJobApplicationsByEmployer({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.applications).toHaveLength(1);
      expect(result.applications[0].jobTitle).toBe("Software Engineer");
      expect(result.total).toBe(1);
    }
    expect(requireCapability).toHaveBeenCalledWith("company.read.linked");
  });

  it("filters by status", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await actions.listJobApplicationsByEmployer({ status: "interviewed" });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: "interviewed" },
      }),
    );
  });

  it("paginates results", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await actions.listJobApplicationsByEmployer({ page: 2, limit: 5 });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 }),
    );
  });

  it("uses empty where when no status filter", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(50);

    const result = await actions.listJobApplicationsByEmployer({});
    expect(result.total).toBe(50);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} }),
    );
  });

  it("handles null candidate in by-employer results", async () => {
    const dbRow = {
      id: 3,
      jobListingId: 42,
      candidateId: 103,
      status: "applied",
      coverLetter: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      jobListing: { title: "Designer" },
      candidate: null,
    };
    mockFindMany.mockResolvedValue([dbRow]);
    mockCount.mockResolvedValue(1);

    const result = await actions.listJobApplicationsByEmployer({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.applications).toHaveLength(1);
      expect(result.applications[0].candidateName).toBeNull();
      expect(result.applications[0].jobTitle).toBe("Designer");
    }
  });

  it("falls back to candidate_name_ar in by-employer results", async () => {
    const dbRow = {
      id: 4,
      applicationId: 4,
      jobListingId: 43,
      candidateId: 104,
      status: "applied",
      coverLetter: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      jobListing: { title: "Engineer" },
      candidate: {
        candidate_id: 104,
        candidate_name: null,
        candidate_name_ar: "فاطمة",
      },
    };
    mockFindMany.mockResolvedValue([dbRow]);
    mockCount.mockResolvedValue(1);

    const result = await actions.listJobApplicationsByEmployer({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.applications[0].candidateName).toBe("فاطمة");
      expect(result.applications[0].jobTitle).toBe("Engineer");
    }
  });
});

// ---------------------------------------------------------------------------
// updateApplicationStatus
// ---------------------------------------------------------------------------

describe("updateApplicationStatus", () => {
  it("updates application status successfully", async () => {
    mockUpdate.mockResolvedValue({ applicationId: 1, status: "accepted" });

    const result = await actions.updateApplicationStatus({
      applicationId: 1,
      status: "accepted",
    });

    expect(result.success).toBe(true);
    expect(requireCapability).toHaveBeenCalledWith("company.write.linked");
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: "accepted" },
    });
  });

  it("accepts when status changes to applied", async () => {
    mockUpdate.mockResolvedValue({ id: 1, status: "applied" });

    const result = await actions.updateApplicationStatus({
      applicationId: 1,
      status: "applied",
    });

    expect(result.success).toBe(true);
  });
});
