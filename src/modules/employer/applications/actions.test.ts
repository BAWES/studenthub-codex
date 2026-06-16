import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    company_contact: {
      findFirst: vi.fn(),
    },
    job_listing_application: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

// Mock session
vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn().mockResolvedValue(undefined),
  getSession: vi.fn().mockResolvedValue({ id: "contact-uuid-1", role: "company" } as never),
}));

const { listEmployerApplications } = await import("./actions");
const { getSession } = await import("@/modules/auth/session");

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const fakeApplicationRow = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 1,
  jobListingId: 42,
  candidateId: 7,
  status: "pending",
  coverLetter: "I am interested",
  createdAt: new Date("2026-06-10"),
  updatedAt: new Date("2026-06-11"),
  jobListing: { title: "Software Engineer" },
  candidate: { candidate_name: "Ahmed Al-Sabah", candidate_name_ar: "أحمد الصباح" },
  ...overrides,
});

/** Clear call history before each test. Each test sets its own implementations. */
beforeEach(() => {
  vi.clearAllMocks();
  // Restore the default getSession return value
  vi.mocked(getSession).mockResolvedValue({ id: "contact-uuid-1", role: "company" } as never);
});

// ---------------------------------------------------------------------------
// listEmployerApplications
// ---------------------------------------------------------------------------

describe("listEmployerApplications", () => {
  it("returns empty result when no session", async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    const result = await listEmployerApplications({});
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.metrics.total).toBe(0);
  });

  it("returns empty result when no linked company", async () => {
    vi.mocked(prisma.company_contact.findFirst).mockResolvedValue(null);

    const result = await listEmployerApplications({});
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("returns paginated results with metrics", async () => {
    vi.mocked(prisma.company_contact.findFirst).mockResolvedValue({
      company: { company_id: 7 },
    } as never);

    vi.mocked(prisma.job_listing_application.findMany).mockResolvedValue([
      fakeApplicationRow({ id: 1 }),
      fakeApplicationRow({ id: 2 }),
    ] as never);

    vi.mocked(prisma.job_listing_application.count)
      .mockResolvedValueOnce(25)
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(3);

    const result = await listEmployerApplications({ page: 1, limit: 50 });

    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(25);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(50);
    expect(result.totalPages).toBe(1);
    expect(result.metrics.pending).toBe(10);
    expect(result.metrics.accepted).toBe(5);
    expect(result.metrics.rejected).toBe(3);
  });

  it("queries filtered by employer ID", async () => {
    vi.mocked(prisma.company_contact.findFirst).mockResolvedValue({
      company: { company_id: 7 },
    } as never);

    vi.mocked(prisma.job_listing_application.findMany).mockResolvedValue([]);
    vi.mocked(prisma.job_listing_application.count)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);

    await listEmployerApplications({});

    expect(prisma.company_contact.findFirst).toHaveBeenCalledWith({
      where: { contact_uuid: "contact-uuid-1" },
      select: { company: { select: { company_id: true } } },
    });
    const whereArg = vi.mocked(prisma.job_listing_application.findMany).mock.calls[0][0]?.where;
    expect(whereArg).toEqual({
      jobListing: { employerId: 7 },
    });
  });

  it("filters by status when provided", async () => {
    vi.mocked(prisma.company_contact.findFirst).mockResolvedValue({
      company: { company_id: 7 },
    } as never);

    vi.mocked(prisma.job_listing_application.findMany).mockResolvedValue([]);
    vi.mocked(prisma.job_listing_application.count)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);

    await listEmployerApplications({ status: "accepted" });

    const whereArg = vi.mocked(prisma.job_listing_application.findMany).mock.calls[0][0]?.where;
    expect(whereArg).toHaveProperty("status", "accepted");
  });

  it("maps candidate names correctly (fallback to Arabic)", async () => {
    vi.mocked(prisma.company_contact.findFirst).mockResolvedValue({
      company: { company_id: 7 },
    } as never);

    vi.mocked(prisma.job_listing_application.findMany).mockResolvedValue([
      fakeApplicationRow({
        candidate: { candidate_name: null, candidate_name_ar: "أحمد الصباح" },
      }),
    ] as never);

    vi.mocked(prisma.job_listing_application.count)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);

    const result = await listEmployerApplications({});
    expect(result.items[0].candidateName).toBe("أحمد الصباح");
  });

  it("maps candidate names as null when both are null", async () => {
    vi.mocked(prisma.company_contact.findFirst).mockResolvedValue({
      company: { company_id: 7 },
    } as never);

    vi.mocked(prisma.job_listing_application.findMany).mockResolvedValue([
      fakeApplicationRow({
        candidate: { candidate_name: null, candidate_name_ar: null },
      }),
    ] as never);

    vi.mocked(prisma.job_listing_application.count)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);

    const result = await listEmployerApplications({});
    expect(result.items[0].candidateName).toBeNull();
  });

  it("passes skip and take based on page/limit", async () => {
    vi.mocked(prisma.company_contact.findFirst).mockResolvedValue({
      company: { company_id: 7 },
    } as never);

    vi.mocked(prisma.job_listing_application.findMany).mockResolvedValue([]);
    vi.mocked(prisma.job_listing_application.count)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);

    await listEmployerApplications({ page: 3, limit: 20 });

    const callArgs = vi.mocked(prisma.job_listing_application.findMany).mock.calls[0][0];
    expect(callArgs).toHaveProperty("skip", 40);
    expect(callArgs).toHaveProperty("take", 20);
  });

  it("returns empty result for invalid input", async () => {
    vi.mocked(prisma.company_contact.findFirst).mockResolvedValue({
      company: { company_id: 7 },
    } as never);

    vi.mocked(prisma.job_listing_application.findMany).mockResolvedValue([]);
    vi.mocked(prisma.job_listing_application.count)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);

    const result = await listEmployerApplications({ page: -1 } as never);
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });
});
