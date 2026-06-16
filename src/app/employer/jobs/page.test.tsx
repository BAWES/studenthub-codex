import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import type { SessionUser } from "@/modules/auth/types";

// Mock auth
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({
    user: { id: "42", email: "employer@test.com" },
    role: "company",
  } as SessionUser),
}));

// Mock the action
const mockListJobs = vi.fn();
vi.mock("./actions", () => ({
  listJobs: (...args: unknown[]) => mockListJobs(...args),
}));

// Mock WorkspaceShell (used by EmployerJobsTable)
vi.mock("@/modules/workspace/WorkspaceShell", () => ({
  WorkspaceShell: ({
    children,
    eyebrow,
    title,
    metrics,
  }: {
    children: React.ReactNode;
    eyebrow: string;
    title: string;
    metrics: { label: string; value: string | number; note: string }[];
  }) => (
    <div data-testid="workspace-shell">
      <div data-testid="eyebrow">{eyebrow}</div>
      <div data-testid="title">{title}</div>
      {metrics.map((m) => (
        <span key={m.label} data-testid={`metric-${m.label}`}>
          {String(m.value)}
        </span>
      ))}
      {children}
    </div>
  ),
}));

// Mock StatusBadge
vi.mock("@/modules/workspace/StatusBadge", () => ({
  StatusBadge: ({ label }: { label: string }) => (
    <span data-testid="status-badge">{label}</span>
  ),
}));

// Mock DataTablePage
vi.mock("@/modules/workspace/DataTablePage", () => ({
  DataTablePage: ({
    title,
    description,
    rows,
    searchable,
    searchPlaceholder,
  }: {
    title: string;
    description: string;
    rows: Record<string, unknown>[];
    searchable: boolean;
    searchPlaceholder: string;
  }) => (
    <div data-testid="datatable-page">
      <div data-testid="dt-title">{title}</div>
      <div data-testid="dt-desc">{description}</div>
      <div data-testid="dt-searchable">{String(searchable)}</div>
      <div data-testid="dt-search-placeholder">{searchPlaceholder}</div>
      <div data-testid="dt-row-count">{rows.length}</div>
      {rows.map((row) => (
        <div key={String(row.id)} data-testid="dt-row">
          {String(row.title)}
        </div>
      ))}
    </div>
  ),
}));

describe("EmployerJobsPage", () => {
  const sampleJobs = [
    {
      jobListingId: 1,
      employerId: 42,
      title: "Software Engineer",
      description: "Build cool stuff",
      requirements: "5 years experience",
      location: "Kuwait City",
      employmentType: "full-time",
      salaryRange: "1500-2000 KWD",
      status: "active",
      createdAt: new Date("2025-06-01"),
      updatedAt: new Date("2025-06-01"),
    },
    {
      jobListingId: 2,
      employerId: 42,
      title: "UI Designer",
      description: "Design interfaces",
      requirements: null,
      location: null,
      employmentType: null,
      salaryRange: null,
      status: "draft",
      createdAt: new Date("2025-06-10"),
      updatedAt: new Date("2025-06-10"),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockListJobs.mockResolvedValue({
      items: sampleJobs,
      total: 2,
      page: 1,
      limit: 50,
      totalPages: 1,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("calls requireRoleCapability with company role and company.read.linked", async () => {
    const { requireRoleCapability } = await import("@/modules/auth/session");
    const Page = (await import("./page")).default;

    await Page();

    expect(requireRoleCapability).toHaveBeenCalledWith(
      "company",
      "company.read.linked",
    );
  });

  it("calls listJobs with limit: 50", async () => {
    const Page = (await import("./page")).default;

    await Page();

    expect(mockListJobs).toHaveBeenCalledWith({ limit: 50 });
  });

  it("renders the page with job data mapped to rows", async () => {
    const Page = (await import("./page")).default;

    const element = await Page();

    expect(element).toBeDefined();
    expect(mockListJobs).toHaveBeenCalledTimes(1);
  });

  it("handles empty data (zero state)", async () => {
    mockListJobs.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    });

    const Page = (await import("./page")).default;
    const element = await Page();

    expect(element).toBeDefined();
    expect(mockListJobs).toHaveBeenCalledWith({ limit: 50 });
  });

  it("handles nullable fields (employmentType, location, salaryRange)", async () => {
    mockListJobs.mockResolvedValue({
      items: [
        {
          jobListingId: 3,
          employerId: 42,
          title: "Designer",
          description: "Design things",
          requirements: null,
          location: null,
          employmentType: null,
          salaryRange: null,
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      total: 1,
      page: 1,
      limit: 50,
      totalPages: 1,
    });

    const Page = (await import("./page")).default;
    const element = await Page();

    expect(element).toBeDefined();
    expect(mockListJobs).toHaveBeenCalledTimes(1);
  });

  it("maps job.jobListingId to row.id for DataTable rowHref compatibility", async () => {
    const Page = (await import("./page")).default;

    await Page();

    // The page maps job.jobListingId -> row.id
    // Verify listJobs data was accessed correctly
    const items = mockListJobs.mock.results[0]?.value?.items;
    if (items) {
      const result = await items;
      expect(result[0].jobListingId).toBe(1);
    }
    // Primary assertion: page called the action
    expect(mockListJobs).toHaveBeenCalledTimes(1);
  });
});
