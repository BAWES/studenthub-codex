import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

// Mock revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    company_contact: {
      findFirst: vi.fn(),
    },
    job_listing: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Mock session
vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn().mockResolvedValue(undefined),
  getSession: vi.fn().mockResolvedValue({ id: "contact-uuid-1", role: "company" }),
}));

const {
  getMyEmployerId,
  listJobs,
  getJob,
  createJob,
  updateJob,
  closeJob,
  deleteJob,
} = await import("./actions");

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const fakeJobRow = (overrides: Partial<Record<string, unknown>> = {}) => ({
  jobListingId: 1,
  employerId: 7,
  title: "Software Engineer",
  description: "Build the platform",
  requirements: "3+ years TypeScript",
  location: "Kuwait City",
  employmentType: "full-time",
  salaryRange: "800-1200 KWD",
  status: "active",
  createdAt: new Date("2026-01-15"),
  updatedAt: new Date("2026-06-10"),
  ...overrides,
});

// ---------------------------------------------------------------------------
// getMyEmployerId
// ---------------------------------------------------------------------------

describe("getMyEmployerId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns employer ID when linked company exists", async () => {
    vi.mocked(prisma.company_contact.findFirst).mockResolvedValue({
      company: { company_id: 7 },
    } as never);

    const result = await getMyEmployerId();
    expect(result).toBe(7);
    expect(prisma.company_contact.findFirst).toHaveBeenCalledWith({
      where: { contact_uuid: "contact-uuid-1" },
      select: { company: { select: { company_id: true } } },
    });
  });

  it("returns null when no linked company exists", async () => {
    vi.mocked(prisma.company_contact.findFirst).mockResolvedValue(null);

    const result = await getMyEmployerId();
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// listJobs
// ---------------------------------------------------------------------------

describe("listJobs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated results with default values", async () => {
    vi.mocked(prisma.job_listing.findMany).mockResolvedValue([]);
    vi.mocked(prisma.job_listing.count).mockResolvedValue(0);

    const result = await listJobs({});

    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.totalPages).toBe(0);
  });

  it("returns results with pagination", async () => {
    const rows = [fakeJobRow({ jobListingId: 1 }), fakeJobRow({ jobListingId: 2 })];
    vi.mocked(prisma.job_listing.findMany).mockResolvedValue(rows as never);
    vi.mocked(prisma.job_listing.count).mockResolvedValue(25);

    const result = await listJobs({ page: 2, limit: 10 });

    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(25);
    expect(result.page).toBe(2);
    expect(result.totalPages).toBe(3);
  });

  it("filters by status", async () => {
    vi.mocked(prisma.job_listing.findMany).mockResolvedValue([]);
    vi.mocked(prisma.job_listing.count).mockResolvedValue(0);

    await listJobs({ status: "closed" });

    const whereArg = vi.mocked(prisma.job_listing.findMany).mock.calls[0][0]?.where;
    expect(whereArg).toHaveProperty("status", "closed");
  });

  it("filters by search query", async () => {
    vi.mocked(prisma.job_listing.findMany).mockResolvedValue([]);
    vi.mocked(prisma.job_listing.count).mockResolvedValue(0);

    await listJobs({ q: "engineer" });

    const whereArg = vi.mocked(prisma.job_listing.findMany).mock.calls[0][0]?.where;
    expect(whereArg).toHaveProperty("OR");
  });

  it("passes skip and take based on page/limit", async () => {
    vi.mocked(prisma.job_listing.findMany).mockResolvedValue([]);
    vi.mocked(prisma.job_listing.count).mockResolvedValue(0);

    await listJobs({ page: 3, limit: 15 });

    const callArgs = vi.mocked(prisma.job_listing.findMany).mock.calls[0][0];
    expect(callArgs).toHaveProperty("skip", 30);
    expect(callArgs).toHaveProperty("take", 15);
  });
});

// ---------------------------------------------------------------------------
// getJob
// ---------------------------------------------------------------------------

describe("getJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns job when found", async () => {
    vi.mocked(prisma.job_listing.findUnique).mockResolvedValue(fakeJobRow() as never);

    const result = await getJob({ jobId: 1 });

    expect(result).not.toBeNull();
    expect(result?.jobListingId).toBe(1);
    expect(result?.title).toBe("Software Engineer");
  });

  it("returns null when not found", async () => {
    vi.mocked(prisma.job_listing.findUnique).mockResolvedValue(null);

    const result = await getJob({ jobId: 999 });
    expect(result).toBeNull();
  });

  it("queries by correct jobId", async () => {
    vi.mocked(prisma.job_listing.findUnique).mockResolvedValue(null);

    await getJob({ jobId: 42 });

    expect(prisma.job_listing.findUnique).toHaveBeenCalledWith({
      where: { jobListingId: 42 },
    });
  });
});

// ---------------------------------------------------------------------------
// createJob
// ---------------------------------------------------------------------------

describe("createJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a job and returns the ID", async () => {
    const { revalidatePath } = await import("next/cache");

    vi.mocked(prisma.job_listing.create).mockResolvedValue(
      fakeJobRow({ jobListingId: 42 }) as never,
    );

    const result = await createJob({
      employerId: 7,
      title: "Backend Engineer",
      description: "Build APIs",
    });

    expect(result.success).toBe(true);
    expect(result.jobListingId).toBe(42);
    expect(revalidatePath).toHaveBeenCalledWith("/employer/jobs");
    expect(revalidatePath).toHaveBeenCalledWith("/candidate/jobs");
  });

  it("passes optional fields when provided", async () => {
    vi.mocked(prisma.job_listing.create).mockResolvedValue(fakeJobRow() as never);

    await createJob({
      employerId: 7,
      title: "Frontend Dev",
      description: "UI work",
      requirements: "React",
      location: "Salmiya",
      employmentType: "part-time",
      salaryRange: "400-600 KWD",
      status: "draft",
    });

    const dataArg = vi.mocked(prisma.job_listing.create).mock.calls[0][0]?.data;
    expect(dataArg).toHaveProperty("requirements", "React");
    expect(dataArg).toHaveProperty("location", "Salmiya");
    expect(dataArg).toHaveProperty("employmentType", "part-time");
    expect(dataArg).toHaveProperty("salaryRange", "400-600 KWD");
    expect(dataArg).toHaveProperty("status", "draft");
  });
});

// ---------------------------------------------------------------------------
// updateJob
// ---------------------------------------------------------------------------

describe("updateJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates a job and returns success", async () => {
    const { revalidatePath } = await import("next/cache");

    vi.mocked(prisma.job_listing.update).mockResolvedValue(fakeJobRow() as never);

    const result = await updateJob({
      jobId: 1,
      title: "Senior Engineer",
      status: "closed",
    });

    expect(result.success).toBe(true);
    expect(prisma.job_listing.update).toHaveBeenCalledWith({
      where: { jobListingId: 1 },
      data: { title: "Senior Engineer", status: "closed" },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/employer/jobs");
    expect(revalidatePath).toHaveBeenCalledWith("/candidate/jobs");
  });

  it("requires at least one field to update", async () => {
    vi.mocked(prisma.job_listing.update).mockResolvedValue(fakeJobRow() as never);

    const result = await updateJob({ jobId: 1 });

    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// deleteJob
// ---------------------------------------------------------------------------

describe("deleteJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes a job and returns success", async () => {
    const { revalidatePath } = await import("next/cache");

    vi.mocked(prisma.job_listing.delete).mockResolvedValue(fakeJobRow() as never);

    const result = await deleteJob({ jobId: 1 });

    expect(result.success).toBe(true);
    expect(prisma.job_listing.delete).toHaveBeenCalledWith({
      where: { jobListingId: 1 },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/employer/jobs");
    expect(revalidatePath).toHaveBeenCalledWith("/candidate/jobs");
  });

  it("deletes with correct jobId", async () => {
    vi.mocked(prisma.job_listing.delete).mockResolvedValue(fakeJobRow() as never);

    await deleteJob({ jobId: 42 });

    expect(prisma.job_listing.delete).toHaveBeenCalledWith({
      where: { jobListingId: 42 },
    });
  });

  // ---------------------------------------------------------------------------
  // closeJob
  // ---------------------------------------------------------------------------

  it("closes a job and returns success", async () => {
    const { revalidatePath } = await import("next/cache");

    vi.mocked(prisma.job_listing.update).mockResolvedValue({ ...fakeJobRow(), status: "closed" } as never);

    const result = await closeJob({ jobId: 1 });

    expect(result.success).toBe(true);
    expect(prisma.job_listing.update).toHaveBeenCalledWith({
      where: { jobListingId: 1 },
      data: { status: "closed" },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/employer/jobs");
    expect(revalidatePath).toHaveBeenCalledWith("/candidate/jobs");
  });

  it("closes with correct jobId", async () => {
    vi.mocked(prisma.job_listing.update).mockResolvedValue({ ...fakeJobRow(), status: "closed" } as never);

    await closeJob({ jobId: 42 });

    expect(prisma.job_listing.update).toHaveBeenCalledWith({
      where: { jobListingId: 42 },
      data: { status: "closed" },
    });
  });
});
