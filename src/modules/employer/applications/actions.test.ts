import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mock the employer applications actions dependency
// ---------------------------------------------------------------------------
vi.mock("@/modules/employer/jobs/[id]/applications/actions", () => ({
  listJobApplicationsByEmployer: vi.fn(),
  updateApplicationStatus: vi.fn(),
}));

// Mock session
vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn(),
}));

const { listJobApplicationsByEmployer, updateApplicationStatus: mockedUpdateAppStatus } =
  await import("@/modules/employer/jobs/[id]/applications/actions");
const auth = await import("@/modules/auth/session");
const actions = await import("./actions");

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockApplications = [
  {
    applicationId: 1,
    candidateId: 101,
    candidateName: "Ahmed Ali",
    status: "applied",
    coverLetter: null,
    createdAt: new Date("2026-06-15"),
    updatedAt: new Date("2026-06-15"),
    jobTitle: "Software Engineer Intern",
  },
  {
    applicationId: 2,
    candidateId: 102,
    candidateName: "Sara Hassan",
    status: "accepted",
    coverLetter: "I am interested.",
    createdAt: new Date("2026-06-14"),
    updatedAt: new Date("2026-06-16"),
    jobTitle: "Marketing Intern",
  },
  {
    applicationId: 3,
    candidateId: 103,
    candidateName: null,
    status: "rejected",
    coverLetter: null,
    createdAt: new Date("2026-06-13"),
    updatedAt: new Date("2026-06-14"),
    jobTitle: "Data Analyst Intern",
  },
  {
    applicationId: 4,
    candidateId: 104,
    candidateName: "Khalid Omar",
    status: "pending_review",
    coverLetter: null,
    createdAt: new Date("2026-06-12"),
    updatedAt: new Date("2026-06-12"),
    jobTitle: "Software Engineer Intern",
  },
];

// ---------------------------------------------------------------------------
// Tests — listEmployerApplications
// ---------------------------------------------------------------------------

describe("listEmployerApplications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth.requireCapability).mockResolvedValue(undefined as never);
  });

  it("returns applications and metrics with default pagination", async () => {
    vi.mocked(listJobApplicationsByEmployer).mockResolvedValue({
      success: true as const,
      applications: mockApplications,
      total: 4,
    });

    const result = await actions.listEmployerApplications({});

    expect(auth.requireCapability).toHaveBeenCalledWith("company.read.linked");
    expect(result.success).toBe(true);
    expect(result.applications).toHaveLength(4);
    expect(result.total).toBe(4);
    expect(result.metrics).toEqual({
      total: 4,
      pending: 2, // applied + pending_review
      accepted: 1,
      rejected: 1,
    });
  });

  it("returns mapped application fields", async () => {
    vi.mocked(listJobApplicationsByEmployer).mockResolvedValue({
      success: true as const,
      applications: [mockApplications[0]],
      total: 1,
    });

    const result = await actions.listEmployerApplications({});

    const app = result.applications[0];
    expect(app.id).toBe(1);
    expect(app.jobTitle).toBe("Software Engineer Intern");
    expect(app.candidateName).toBe("Ahmed Ali");
    expect(app.status).toBe("applied");
    expect(app.createdAt).toBeInstanceOf(Date);
  });

  it("passes pagination options through", async () => {
    vi.mocked(listJobApplicationsByEmployer).mockResolvedValue({
      success: true as const,
      applications: [],
      total: 0,
    });

    await actions.listEmployerApplications({ page: 2, limit: 10 });

    expect(listJobApplicationsByEmployer).toHaveBeenCalledWith({
      page: 2,
      limit: 10,
      status: undefined,
    });
  });

  it("passes status filter through", async () => {
    vi.mocked(listJobApplicationsByEmployer).mockResolvedValue({
      success: true as const,
      applications: [mockApplications[1]],
      total: 1,
    });

    const result = await actions.listEmployerApplications({ status: "accepted" });

    expect(listJobApplicationsByEmployer).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      status: "accepted",
    });
    expect(result.metrics.accepted).toBe(1);
  });

  it("returns zero metrics for empty list", async () => {
    vi.mocked(listJobApplicationsByEmployer).mockResolvedValue({
      success: true as const,
      applications: [],
      total: 0,
    });

    const result = await actions.listEmployerApplications({});

    expect(result.metrics).toEqual({
      total: 0,
      pending: 0,
      accepted: 0,
      rejected: 0,
    });
  });

  it("returns empty result on invalid input", async () => {
    // negative page triggers parse failure
    const result = await actions.listEmployerApplications({ page: -1 } as any);

    expect(listJobApplicationsByEmployer).not.toHaveBeenCalled();
    expect(result.applications).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.metrics).toEqual({ total: 0, pending: 0, accepted: 0, rejected: 0 });
  });
});

// ---------------------------------------------------------------------------
// Tests — updateApplicationStatus
// ---------------------------------------------------------------------------

describe("updateApplicationStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth.requireCapability).mockResolvedValue(undefined as never);
  });

  it("calls jobs-level updateApplicationStatus with correct params", async () => {
    vi.mocked(mockedUpdateAppStatus).mockResolvedValue({ success: true });

    const result = await actions.updateApplicationStatus({
      applicationId: 42,
      status: "accepted",
    });

    expect(auth.requireCapability).toHaveBeenCalledWith("company.write.linked");
    expect(mockedUpdateAppStatus).toHaveBeenCalledWith({
      applicationId: 42,
      status: "accepted",
    });
    expect(result).toEqual({ success: true });
  });

  it("rejects invalid status", async () => {
    await expect(
      actions.updateApplicationStatus({ applicationId: 1, status: "invalid_status" } as any),
    ).rejects.toThrow();
  });

  it("rejects missing applicationId", async () => {
    await expect(
      actions.updateApplicationStatus({ status: "accepted" } as any),
    ).rejects.toThrow();
  });

  it("rejects zero applicationId", async () => {
    await expect(
      actions.updateApplicationStatus({ applicationId: 0, status: "accepted" }),
    ).rejects.toThrow();
  });
});
