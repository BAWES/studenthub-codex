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
  it("accepts valid input with defaults", () => {
    const r = listJobApplicationsSchema.safeParse({ jobListingId: 1 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.jobListingId).toBe(1);
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts optional status filter", () => {
    const r = listJobApplicationsSchema.safeParse({
      jobListingId: 1,
      status: "reviewing",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.status).toBe("reviewing");
    }
  });

  it("accepts custom pagination", () => {
    const r = listJobApplicationsSchema.safeParse({
      jobListingId: 1,
      page: 2,
      limit: 50,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(50);
    }
  });

  it("coerces string pagination", () => {
    const r = listJobApplicationsSchema.safeParse({
      jobListingId: "1",
      page: "2",
      limit: "10",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.jobListingId).toBe(1);
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });

  it("rejects missing jobListingId", () => {
    expect(listJobApplicationsSchema.safeParse({}).success).toBe(false);
  });

  it("rejects negative jobListingId", () => {
    expect(
      listJobApplicationsSchema.safeParse({ jobListingId: -1 }).success,
    ).toBe(false);
  });

  it("rejects limit over 100", () => {
    expect(
      listJobApplicationsSchema.safeParse({ jobListingId: 1, limit: 200 }).success,
    ).toBe(false);
  });

  it("rejects page below 1", () => {
    expect(
      listJobApplicationsSchema.safeParse({ jobListingId: 1, page: 0 }).success,
    ).toBe(false);
  });
});

describe("listJobApplicationsByEmployerSchema", () => {
  it("accepts empty input (defaults)", () => {
    const r = listJobApplicationsByEmployerSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts with status filter", () => {
    const r = listJobApplicationsByEmployerSchema.safeParse({
      status: "shortlisted",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.status).toBe("shortlisted");
    }
  });
});

describe("updateApplicationStatusSchema", () => {
  it("accepts valid application status update", () => {
    const r = updateApplicationStatusSchema.safeParse({
      applicationId: 1,
      status: "accepted",
    });
    expect(r.success).toBe(true);
  });

  it("rejects invalid status value", () => {
    expect(
      updateApplicationStatusSchema.safeParse({
        applicationId: 1,
        status: "invalid_status",
      }).success,
    ).toBe(false);
  });

  it("rejects missing applicationId", () => {
    expect(
      updateApplicationStatusSchema.safeParse({ status: "rejected" }).success,
    ).toBe(false);
  });

  it("rejects negative applicationId", () => {
    expect(
      updateApplicationStatusSchema.safeParse({
        applicationId: -1,
        status: "applied",
      }).success,
    ).toBe(false);
  });

  it("accepts all valid statuses", () => {
    const statuses = ["applied", "reviewing", "shortlisted", "interviewed", "accepted", "rejected"];
    for (const status of statuses) {
      expect(
        updateApplicationStatusSchema.safeParse({ applicationId: 1, status }).success,
      ).toBe(true);
    }
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

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const { requireCapability } = await import("@/modules/auth/session");
const apps = await import("./actions");

const mockUser = {
  role: "company" as const,
  id: "user-1",
  name: "Employer User",
  email: "employer@company.local",
  issuedAt: Date.now(),
};

function makeDbRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    candidateId: 100,
    status: "applied",
    coverLetter: "I am interested in this role.",
    createdAt: new Date("2026-06-10"),
    updatedAt: new Date("2026-06-10"),
    candidate: {
      candidate_id: 100,
      candidate_name: "Jane Doe",
      candidate_name_ar: null,
    },
    jobListing: { title: "Software Engineer" },
    ...overrides,
  };
}

describe("listJobApplications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns applications for a job with defaults", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
    mockFindMany.mockResolvedValue([makeDbRow()]);
    mockCount.mockResolvedValue(1);

    const result = await apps.listJobApplications({ jobListingId: 1 });

    expect(requireCapability).toHaveBeenCalledWith("company.read.linked");
    expect(result.success).toBe(true);
    expect(result.applications).toHaveLength(1);
    expect(result.total).toBe(1);

    const app = result.applications[0];
    expect(app.candidateName).toBe("Jane Doe");
    expect(app.status).toBe("applied");
  });

  it("filters by status when provided", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await apps.listJobApplications({ jobListingId: 1, status: "reviewing" });

    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.where.status).toBe("reviewing");
  });

  it("applies pagination correctly", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await apps.listJobApplications({ jobListingId: 1, page: 3, limit: 10 });

    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.skip).toBe(20);
    expect(callArgs.take).toBe(10);
  });

  it("returns candidates with null name when candidate missing", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
    mockFindMany.mockResolvedValue([
      makeDbRow({ candidate: null }),
    ]);
    mockCount.mockResolvedValue(1);

    const result = await apps.listJobApplications({ jobListingId: 1 });

    expect(result.applications[0].candidateName).toBeNull();
  });

  it("throws when requireCapability rejects", async () => {
    vi.mocked(requireCapability).mockRejectedValue(new Error("Unauthorized"));

    await expect(
      apps.listJobApplications({ jobListingId: 1 }),
    ).rejects.toThrow("Unauthorized");
    expect(mockFindMany).not.toHaveBeenCalled();
  });
});

describe("listJobApplicationsByEmployer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all applications across employer's jobs", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
    mockFindMany.mockResolvedValue([makeDbRow()]);
    mockCount.mockResolvedValue(1);

    const result = await apps.listJobApplicationsByEmployer({});

    expect(result.success).toBe(true);
    expect(result.applications).toHaveLength(1);
    expect(result.total).toBe(1);

    const app = result.applications[0];
    expect(app.jobTitle).toBe("Software Engineer");
    expect(app.candidateName).toBe("Jane Doe");
  });

  it("applies pagination by default", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await apps.listJobApplicationsByEmployer({});

    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.skip).toBe(0);
    expect(callArgs.take).toBe(20);
  });

  it("filters by status when provided", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await apps.listJobApplicationsByEmployer({ status: "shortlisted" });

    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.where.status).toBe("shortlisted");
  });
});

describe("updateApplicationStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates application status", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
    mockUpdate.mockResolvedValue(makeDbRow());

    const result = await apps.updateApplicationStatus({
      applicationId: 1,
      status: "accepted",
    });

    expect(requireCapability).toHaveBeenCalledWith("company.write.linked");
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: "accepted" },
    });
    expect(result).toEqual({ success: true });
  });

  it("rejects invalid status", async () => {
    await expect(
      apps.updateApplicationStatus({
        applicationId: 1,
        status: "invalid" as any,
      }),
    ).rejects.toThrow();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("throws on invalid input (negative ID)", async () => {
    await expect(
      apps.updateApplicationStatus({ applicationId: -1, status: "rejected" }),
    ).rejects.toThrow();
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
