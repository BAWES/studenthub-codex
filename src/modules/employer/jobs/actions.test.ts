import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock functions ──────────────────────────────────
const { mockRequireCapability, mockGetSession, mockRevalidatePath, mockFindFirst, mockFindMany, mockCount, mockFindUnique, mockCreate, mockUpdate, mockDelete } =
  vi.hoisted(() => ({
    mockRequireCapability: vi.fn(),
    mockGetSession: vi.fn(),
    mockRevalidatePath: vi.fn(),
    mockFindFirst: vi.fn(),
    mockFindMany: vi.fn(),
    mockCount: vi.fn(),
    mockFindUnique: vi.fn(),
    mockCreate: vi.fn(),
    mockUpdate: vi.fn(),
    mockDelete: vi.fn(),
  }));

// ── Mock session module ─────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
  getSession: mockGetSession,
}));

// ── Mock next/cache ─────────────────────────────────────────
vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

// ── Mock Prisma ─────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    company_contact: {
      findFirst: mockFindFirst,
    },
    job_listing: {
      findMany: mockFindMany,
      count: mockCount,
      findUnique: mockFindUnique,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
    },
  },
}));

import {
  listJobsSchema,
  getJobSchema,
  createJobSchema,
  updateJobSchema,
  deleteJobSchema,
} from "./schemas";

import {
  getMyEmployerId,
  listJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
} from "./actions";

// ===========================================================================
// Input schema validation
// ===========================================================================

describe("listJobsSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const result = listJobsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const result = listJobsSchema.safeParse({ page: 2, limit: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("accepts search query", () => {
    const result = listJobsSchema.safeParse({ q: "developer" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.q).toBe("developer");
  });

  it("accepts status filter", () => {
    const result = listJobsSchema.safeParse({ status: "active" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.status).toBe("active");
  });

  it("rejects limit over 100", () => {
    const result = listJobsSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listJobsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects zero page", () => {
    const result = listJobsSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("coerces string page to number", () => {
    const result = listJobsSchema.safeParse({ page: "3" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.page).toBe(3);
  });
});

describe("getJobSchema", () => {
  it("accepts a valid job ID", () => {
    const result = getJobSchema.safeParse({ jobId: 42 });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.jobId).toBe(42);
  });

  it("coerces string jobId to number", () => {
    const result = getJobSchema.safeParse({ jobId: "99" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.jobId).toBe(99);
  });

  it("rejects missing jobId", () => {
    const result = getJobSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects zero jobId", () => {
    const result = getJobSchema.safeParse({ jobId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative jobId", () => {
    const result = getJobSchema.safeParse({ jobId: -5 });
    expect(result.success).toBe(false);
  });
});

describe("createJobSchema", () => {
  it("accepts valid input with all fields", () => {
    const result = createJobSchema.safeParse({
      employerId: 1,
      title: "Software Engineer",
      description: "Build great software",
      requirements: "5 years experience",
      location: "Remote",
      employmentType: "full-time",
      salaryRange: "$100k-$150k",
      status: "active",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid input with only required fields", () => {
    const result = createJobSchema.safeParse({
      employerId: 1,
      title: "Dev",
      description: "Do stuff",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.status).toBe("active");
  });

  it("rejects missing employerId", () => {
    const result = createJobSchema.safeParse({ title: "X", description: "Y" });
    expect(result.success).toBe(false);
  });

  it("rejects empty title", () => {
    const result = createJobSchema.safeParse({ employerId: 1, title: "", description: "Y" });
    expect(result.success).toBe(false);
  });

  it("rejects title over 255 chars", () => {
    const result = createJobSchema.safeParse({
      employerId: 1,
      title: "x".repeat(256),
      description: "Y",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty description", () => {
    const result = createJobSchema.safeParse({ employerId: 1, title: "X", description: "" });
    expect(result.success).toBe(false);
  });
});

describe("updateJobSchema", () => {
  it("accepts valid partial update", () => {
    const result = updateJobSchema.safeParse({
      jobId: 5,
      title: "Updated Title",
      status: "inactive",
    });
    expect(result.success).toBe(true);
  });

  it("accepts update with only jobId (no changes)", () => {
    const result = updateJobSchema.safeParse({ jobId: 5 });
    expect(result.success).toBe(true);
  });

  it("rejects empty jobId", () => {
    const result = updateJobSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects empty title string", () => {
    const result = updateJobSchema.safeParse({ jobId: 1, title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects empty description string", () => {
    const result = updateJobSchema.safeParse({ jobId: 1, description: "" });
    expect(result.success).toBe(false);
  });
});

describe("deleteJobSchema", () => {
  it("accepts a valid job ID", () => {
    const result = deleteJobSchema.safeParse({ jobId: 5 });
    expect(result.success).toBe(true);
  });

  it("coerces string jobId to number", () => {
    const result = deleteJobSchema.safeParse({ jobId: "3" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.jobId).toBe(3);
  });

  it("rejects missing jobId", () => {
    const result = deleteJobSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects zero jobId", () => {
    const result = deleteJobSchema.safeParse({ jobId: 0 });
    expect(result.success).toBe(false);
  });
});

// ===========================================================================
// Action-level tests — mocked DB
// ===========================================================================

describe("getMyEmployerId action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns company ID when company contact found", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockGetSession.mockResolvedValue({ id: "user-uuid" });
    mockFindFirst.mockResolvedValue({
      company: { company_id: 42 },
    });

    const result = await getMyEmployerId();

    expect(mockRequireCapability).toHaveBeenCalledWith("company.read.linked");
    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { contact_uuid: "user-uuid" },
      }),
    );
    expect(result).toBe(42);
  });

  it("returns null when no session", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockGetSession.mockResolvedValue(null);

    const result = await getMyEmployerId();

    expect(result).toBeNull();
    expect(mockFindFirst).not.toHaveBeenCalled();
  });

  it("returns null when no company link found", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockGetSession.mockResolvedValue({ id: "user-uuid" });
    mockFindFirst.mockResolvedValue(null);

    const result = await getMyEmployerId();

    expect(result).toBeNull();
  });

  it("throws when session fails capability check", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(getMyEmployerId()).rejects.toThrow("Unauthorized");
    expect(mockFindFirst).not.toHaveBeenCalled();
  });
});

describe("listJobs action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated list with default params", async () => {
    const dbRows = [
      {
        jobListingId: 1,
        employerId: 1,
        title: "Engineer",
        description: "Build stuff",
        requirements: null,
        location: "Remote",
        employmentType: "full-time",
        salaryRange: null,
        status: "active",
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date("2025-01-02"),
      },
    ];

    mockRequireCapability.mockResolvedValue(undefined);
    mockFindMany.mockResolvedValue(dbRows);
    mockCount.mockResolvedValue(1);

    const result = await listJobs({});

    expect(mockRequireCapability).toHaveBeenCalledWith("company.read.linked");
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 20,
        orderBy: { createdAt: "desc" },
      }),
    );
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.totalPages).toBe(1);
  });

  it("applies search filter when q is provided", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await listJobs({ q: "developer" });

    const findManyCall = mockFindMany.mock.calls[0][0];
    expect(findManyCall.where.OR).toBeDefined();
    expect(findManyCall.where.OR).toContainEqual({
      title: { contains: "developer" },
    });
    expect(findManyCall.where.OR).toContainEqual({
      description: { contains: "developer" },
    });
  });

  it("applies status filter", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await listJobs({ status: "active" });

    const findManyCall = mockFindMany.mock.calls[0][0];
    expect(findManyCall.where.status).toBe("active");
  });

  it("handles pagination correctly", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(50);

    await listJobs({ page: 3, limit: 10 });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 }),
    );
  });

  it("returns empty result on invalid input", async () => {
    mockRequireCapability.mockResolvedValue(undefined);

    const result = await listJobs({ page: 0 }); // zero page = invalid

    expect(result).toEqual({ items: [], total: 0, page: 1, limit: 20, totalPages: 0 });
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(listJobs({})).rejects.toThrow("Unauthorized");
    expect(mockFindMany).not.toHaveBeenCalled();
  });
});

describe("getJob action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns job when found", async () => {
    const dbRow = {
      jobListingId: 42,
      employerId: 1,
      title: "Senior Dev",
      description: "Lead team",
      requirements: "10 years",
      location: "Kuwait",
      employmentType: "full-time",
      salaryRange: "$200k",
      status: "active",
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-15"),
    };

    mockRequireCapability.mockResolvedValue(undefined);
    mockFindUnique.mockResolvedValue(dbRow);

    const result = await getJob({ jobId: 42 });

    expect(mockRequireCapability).toHaveBeenCalledWith("company.read.linked");
    expect(mockFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { jobListingId: 42 } }),
    );
    expect(result).not.toBeNull();
    expect(result!.title).toBe("Senior Dev");
  });

  it("returns null when job not found", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockFindUnique.mockResolvedValue(null);

    const result = await getJob({ jobId: 999 });

    expect(result).toBeNull();
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(getJob({ jobId: 1 })).rejects.toThrow("Unauthorized");
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("throws on invalid input", async () => {
    mockRequireCapability.mockResolvedValue(undefined);

    await expect(getJob({ jobId: 0 })).rejects.toThrow("Job ID is required");
    expect(mockFindUnique).not.toHaveBeenCalled();
  });
});

describe("createJob action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a job listing and returns the new ID", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockCreate.mockResolvedValue({ jobListingId: 100 });

    const result = await createJob({
      employerId: 1,
      title: "New Role",
      description: "Exciting opportunity",
      requirements: "Skills",
      location: "Remote",
      employmentType: "full-time",
      salaryRange: "$80k",
      status: "active",
    });

    expect(mockRequireCapability).toHaveBeenCalledWith("company.write.linked");
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        employerId: 1,
        title: "New Role",
        description: "Exciting opportunity",
        requirements: "Skills",
        location: "Remote",
        employmentType: "full-time",
        salaryRange: "$80k",
        status: "active",
      },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/employer/jobs");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/candidate/jobs");
    expect(result).toEqual({ success: true, jobListingId: 100 });
  });

  it("creates a job listing with defaults", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockCreate.mockResolvedValue({ jobListingId: 101 });

    const result = await createJob({
      employerId: 1,
      title: "Minimal Role",
      description: "Minimal description",
    });

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        employerId: 1,
        title: "Minimal Role",
        description: "Minimal description",
        requirements: undefined,
        location: undefined,
        employmentType: undefined,
        salaryRange: undefined,
        status: "active",
      },
    });
    expect(result).toEqual({ success: true, jobListingId: 101 });
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(createJob({
      employerId: 1,
      title: "X",
      description: "Y",
    })).rejects.toThrow("Unauthorized");
    expect(mockCreate).not.toHaveBeenCalled();
  });
});

describe("updateJob action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates a job listing with partial fields", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockUpdate.mockResolvedValue({});

    const result = await updateJob({
      jobId: 5,
      title: "Updated Title",
      status: "inactive",
    });

    expect(mockRequireCapability).toHaveBeenCalledWith("company.write.linked");
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { jobListingId: 5 },
      data: { title: "Updated Title", status: "inactive" },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/employer/jobs");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/candidate/jobs");
    expect(result).toEqual({ success: true });
  });

  it("updates with all fields", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockUpdate.mockResolvedValue({});

    const result = await updateJob({
      jobId: 5,
      title: "Full Update",
      description: "New desc",
      requirements: "New reqs",
      location: "Office",
      employmentType: "part-time",
      salaryRange: "$50k",
      status: "active",
    });

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { jobListingId: 5 },
      data: {
        title: "Full Update",
        description: "New desc",
        requirements: "New reqs",
        location: "Office",
        employmentType: "part-time",
        salaryRange: "$50k",
        status: "active",
      },
    });
    expect(result).toEqual({ success: true });
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(updateJob({ jobId: 1 })).rejects.toThrow("Unauthorized");
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

describe("deleteJob action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes a job listing", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockDelete.mockResolvedValue({});

    const result = await deleteJob({ jobId: 10 });

    expect(mockRequireCapability).toHaveBeenCalledWith("company.write.linked");
    expect(mockDelete).toHaveBeenCalledWith({
      where: { jobListingId: 10 },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/employer/jobs");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/candidate/jobs");
    expect(result).toEqual({ success: true });
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(deleteJob({ jobId: 1 })).rejects.toThrow("Unauthorized");
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("throws on invalid input", async () => {
    mockRequireCapability.mockResolvedValue(undefined);

    await expect(deleteJob({ jobId: 0 })).rejects.toThrow();
    expect(mockDelete).not.toHaveBeenCalled();
  });
});
