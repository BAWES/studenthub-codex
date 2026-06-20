import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listJobsSchema,
  getJobSchema,
  createJobSchema,
  updateJobSchema,
  deleteJobSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests — pure unit, no mocking required
// ---------------------------------------------------------------------------

describe("listJobsSchema", () => {
  it("accepts empty params (defaults)", () => {
    const r = listJobsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const r = listJobsSchema.safeParse({ page: 3, limit: 10 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(3);
      expect(r.data.limit).toBe(10);
    }
  });

  it("coerces string page and limit", () => {
    const r = listJobsSchema.safeParse({ page: "2", limit: "50" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(50);
    }
  });

  it("rejects limit over 100", () => {
    expect(listJobsSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects limit below 1", () => {
    expect(listJobsSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listJobsSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("accepts status filter", () => {
    const r = listJobsSchema.safeParse({ status: "active" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.status).toBe("active");
    }
  });

  it("accepts text search query", () => {
    const r = listJobsSchema.safeParse({ q: "engineer" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.q).toBe("engineer");
    }
  });
});

describe("getJobSchema", () => {
  it("accepts a valid job ID", () => {
    const r = getJobSchema.safeParse({ jobId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.jobId).toBe(42);
    }
  });

  it("coerces string job ID to number", () => {
    const r = getJobSchema.safeParse({ jobId: "99" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.jobId).toBe(99);
    }
  });

  it("rejects zero job ID", () => {
    expect(getJobSchema.safeParse({ jobId: 0 }).success).toBe(false);
  });

  it("rejects negative job ID", () => {
    expect(getJobSchema.safeParse({ jobId: -1 }).success).toBe(false);
  });

  it("rejects missing jobId field", () => {
    expect(getJobSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-numeric job ID", () => {
    expect(getJobSchema.safeParse({ jobId: "abc" }).success).toBe(false);
  });
});

describe("createJobSchema", () => {
  it("accepts valid minimal input", () => {
    const r = createJobSchema.safeParse({
      employerId: 1,
      title: "Software Engineer",
      description: "Build great software.",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.title).toBe("Software Engineer");
      expect(r.data.status).toBe("active");
    }
  });

  it("accepts full input with all optional fields", () => {
    const r = createJobSchema.safeParse({
      employerId: 1,
      title: "Frontend Developer",
      description: "Build UIs.",
      requirements: "React, TypeScript",
      location: "Kuwait City",
      employmentType: "full-time",
      salaryRange: "KWD 500-1000",
      status: "draft",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.requirements).toBe("React, TypeScript");
      expect(r.data.location).toBe("Kuwait City");
      expect(r.data.salaryRange).toBe("KWD 500-1000");
    }
  });

  it("rejects missing title", () => {
    expect(
      createJobSchema.safeParse({
        employerId: 1,
        description: "test",
      }).success,
    ).toBe(false);
  });

  it("rejects empty title", () => {
    expect(
      createJobSchema.safeParse({
        employerId: 1,
        title: "",
        description: "test",
      }).success,
    ).toBe(false);
  });

  it("rejects missing description", () => {
    expect(
      createJobSchema.safeParse({
        employerId: 1,
        title: "Engineer",
      }).success,
    ).toBe(false);
  });

  it("rejects missing employerId", () => {
    expect(
      createJobSchema.safeParse({
        title: "Engineer",
        description: "test",
      }).success,
    ).toBe(false);
  });

  it("coerces string employerId to number", () => {
    const r = createJobSchema.safeParse({
      employerId: "5",
      title: "Engineer",
      description: "test",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.employerId).toBe(5);
    }
  });
});

describe("updateJobSchema", () => {
  it("accepts valid partial update", () => {
    const r = updateJobSchema.safeParse({ jobId: 1, title: "New Title" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.title).toBe("New Title");
    }
  });

  it("accepts status-only update", () => {
    const r = updateJobSchema.safeParse({ jobId: 1, status: "closed" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.status).toBe("closed");
    }
  });

  it("accepts empty optional fields (partial update)", () => {
    const r = updateJobSchema.safeParse({
      jobId: 1,
      description: "Updated description",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.description).toBe("Updated description");
    }
  });

  it("rejects missing jobId", () => {
    expect(updateJobSchema.safeParse({}).success).toBe(false);
  });
});

describe("deleteJobSchema", () => {
  it("accepts a valid job ID", () => {
    const r = deleteJobSchema.safeParse({ jobId: 1 });
    expect(r.success).toBe(true);
  });

  it("rejects missing jobId", () => {
    expect(deleteJobSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Action tests — mock Prisma + auth
// ---------------------------------------------------------------------------

const mockFindMany = vi.fn();
const mockFindUnique = vi.fn();
const mockCount = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockCompanyContactFindFirst = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    job_listing: {
      findMany: mockFindMany,
      findUnique: mockFindUnique,
      count: mockCount,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
    },
    company_contact: {
      findFirst: mockCompanyContactFindFirst,
    },
  },
}));

vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const { requireCapability, getSession } = await import("@/modules/auth/session");
const { prisma } = await import("@/lib/prisma");
const jobs = await import("./actions");

const mockUser = {
  role: "company" as const,
  id: "user-1",
  name: "Employer User",
  email: "employer@company.local",
  issuedAt: Date.now(),
};

function makeJob(overrides: Record<string, unknown> = {}) {
  return {
    jobListingId: 1,
    employerId: 1,
    title: "Software Engineer",
    description: "Build great software.",
    requirements: null,
    location: "Kuwait City",
    employmentType: "full-time",
    salaryRange: "KWD 800-1200",
    status: "active",
    createdAt: new Date("2026-06-10"),
    updatedAt: new Date("2026-06-10"),
    ...overrides,
  };
}

describe("listJobs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated job listings with defaults", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
    mockFindMany.mockResolvedValue([makeJob()]);
    mockCount.mockResolvedValue(1);

    const result = await jobs.listJobs({});

    expect(requireCapability).toHaveBeenCalledWith("company.read.linked");
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.totalPages).toBe(1);

    const item = result.items[0];
    expect(item.title).toBe("Software Engineer");
    expect(item.location).toBe("Kuwait City");
  });

  it("respects pagination params", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await jobs.listJobs({ page: 3, limit: 10 });

    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.skip).toBe(20);
    expect(callArgs.take).toBe(10);
  });

  it("filters by status", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await jobs.listJobs({ status: "active" });

    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.where.status).toBe("active");
  });

  it("searches by title and description", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await jobs.listJobs({ q: "engineer" });

    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.where.OR).toBeDefined();
    expect(callArgs.where.OR[0].title.contains).toBe("engineer");
    expect(callArgs.where.OR[1].description.contains).toBe("engineer");
  });

  it("orders by createdAt descending", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await jobs.listJobs({});

    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.orderBy.createdAt).toBe("desc");
  });

  it("returns empty result with defaults on invalid input", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);

    const result = await jobs.listJobs({ page: "invalid" as unknown as number });

    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.totalPages).toBe(0);
  });
});

describe("getJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a job listing for valid ID", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
    const fakeJob = makeJob();
    mockFindUnique.mockResolvedValue(fakeJob);

    const result = await jobs.getJob({ jobId: 1 });

    expect(requireCapability).toHaveBeenCalledWith("company.read.linked");
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { jobListingId: 1 },
    });
    expect(result).toBe(fakeJob);
  });

  it("returns null when job not found", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
    mockFindUnique.mockResolvedValue(null);

    const result = await jobs.getJob({ jobId: 999 });

    expect(result).toBeNull();
  });

  it("throws on invalid input", async () => {
    await expect(jobs.getJob({ jobId: -1 })).rejects.toThrow();
    expect(mockFindUnique).not.toHaveBeenCalled();
  });
});

describe("createJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a job listing with valid input", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
    mockCreate.mockResolvedValue(makeJob({ jobListingId: 42 }));

    const result = await jobs.createJob({
      employerId: 1,
      title: "Backend Engineer",
      description: "Build APIs.",
    });

    expect(requireCapability).toHaveBeenCalledWith("company.write.linked");
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        employerId: 1,
        title: "Backend Engineer",
        description: "Build APIs.",
        requirements: undefined,
        location: undefined,
        employmentType: undefined,
        salaryRange: undefined,
        status: "active",
      },
    });
    expect(result.success).toBe(true);
    expect(result.jobListingId).toBe(42);
  });

  it("passes optional fields when provided", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
    mockCreate.mockResolvedValue(makeJob());

    await jobs.createJob({
      employerId: 1,
      title: "Full Stack Dev",
      description: "Full stack role",
      requirements: "Node.js, React",
      location: "Remote",
      employmentType: "contract",
      salaryRange: "KWD 1500-2000",
      status: "draft",
    });

    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.data.requirements).toBe("Node.js, React");
    expect(callArgs.data.location).toBe("Remote");
    expect(callArgs.data.employmentType).toBe("contract");
    expect(callArgs.data.salaryRange).toBe("KWD 1500-2000");
    expect(callArgs.data.status).toBe("draft");
  });

  it("throws on invalid input", async () => {
    await expect(
      jobs.createJob({
        employerId: 1,
        title: "",
        description: "test",
      }),
    ).rejects.toThrow();
    expect(mockCreate).not.toHaveBeenCalled();
  });
});

describe("updateJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates a job listing with partial fields", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
    mockUpdate.mockResolvedValue(makeJob());

    const result = await jobs.updateJob({
      jobId: 1,
      title: "Updated Title",
      status: "closed",
    });

    expect(requireCapability).toHaveBeenCalledWith("company.write.linked");
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { jobListingId: 1 },
      data: { title: "Updated Title", status: "closed" },
    });
    expect(result.success).toBe(true);
  });

  it("updates only description when that is the only field", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
    mockUpdate.mockResolvedValue(makeJob());

    await jobs.updateJob({
      jobId: 1,
      description: "New description",
    });

    const callArgs = mockUpdate.mock.calls[0][0];
    expect(callArgs.data.description).toBe("New description");
    expect(callArgs.data.title).toBeUndefined();
  });

  it("throws on invalid input", async () => {
    await expect(jobs.updateJob({ jobId: -1 })).rejects.toThrow();
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

describe("deleteJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes a job listing by ID", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
    mockDelete.mockResolvedValue(makeJob());

    const result = await jobs.deleteJob({ jobId: 1 });

    expect(requireCapability).toHaveBeenCalledWith("company.write.linked");
    expect(mockDelete).toHaveBeenCalledWith({
      where: { jobListingId: 1 },
    });
    expect(result.success).toBe(true);
  });

  it("throws on invalid input", async () => {
    await expect(jobs.deleteJob({ jobId: 0 })).rejects.toThrow();
    expect(mockDelete).not.toHaveBeenCalled();
  });
});

describe("getMyEmployerId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns employer ID when user has a linked company", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
    vi.mocked(getSession).mockResolvedValue({ id: "contact-uuid-1" } as any);
    mockCompanyContactFindFirst.mockResolvedValue({
      company: { company_id: 42 },
    });

    const result = await jobs.getMyEmployerId();
    expect(result).toBe(42);
    expect(mockCompanyContactFindFirst).toHaveBeenCalledWith({
      where: { contact_uuid: "contact-uuid-1" },
      select: { company: { select: { company_id: true } } },
    });
  });

  it("returns null when no session", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
    vi.mocked(getSession).mockResolvedValue(null);

    const result = await jobs.getMyEmployerId();
    expect(result).toBeNull();
  });

  it("returns null when user has no linked company", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
    vi.mocked(getSession).mockResolvedValue({ id: "contact-uuid-2" } as any);
    mockCompanyContactFindFirst.mockResolvedValue(null);

    const result = await jobs.getMyEmployerId();
    expect(result).toBeNull();
  });
});
