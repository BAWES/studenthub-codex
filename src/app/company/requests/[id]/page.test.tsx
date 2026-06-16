import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({
    user: { id: "1" },
    role: "company",
  }),
}));

vi.mock("@/modules/workspace/ErrorBoundary", () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/modules/workspace/WorkspaceShell", () => ({
  WorkspaceShell: ({
    children,
    eyebrow,
    title,
    metrics,
    primary,
    secondary,
  }: {
    children: React.ReactNode;
    eyebrow: string;
    title: string;
    metrics: { label: string; value: string | number; note: string }[];
    primary?: { title: string; rows: unknown[] };
    secondary?: { title: string; rows: unknown[] };
  }) => (
    <div data-testid="workspace-shell">
      <div data-testid="eyebrow">{eyebrow}</div>
      <div data-testid="title">{title}</div>
      {metrics.map((m) => (
        <span key={m.label} data-testid={`metric-${m.label}`}>
          {m.value}
        </span>
      ))}
      {primary ? <div data-testid="primary-section">{primary.title} ({primary.rows.length})</div> : null}
      {secondary ? <div data-testid="secondary-section">{secondary.title} ({secondary.rows.length})</div> : null}
      {children}
    </div>
  ),
}));

vi.mock("@/modules/workspace/DetailPanels", () => ({
  DetailSection: ({
    title,
    facts,
    type,
    rows,
  }: {
    title: string;
    facts?: { label: string; value: string | React.ReactNode }[];
    type?: string;
    rows?: unknown[];
  }) => (
    <div data-testid={`detail-section${type ? `-${type}` : ""}`}>
      <div data-testid="section-title">{title}</div>
      {facts?.map((f) => (
        <span key={String(f.label)} data-testid={`fact-${f.label}`}>
          {String(f.value)}
        </span>
      ))}
      {type === "list" && rows ? (
        <span data-testid={`list-rows-${title}`}>{rows.length} items</span>
      ) : null}
    </div>
  ),
}));

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date) => d.toISOString().split("T")[0],
}));

const mockGetCompanyRequestDetail = vi.fn();
vi.mock("./actions", () => ({
  getCompanyRequestDetail: (...args: unknown[]) => mockGetCompanyRequestDetail(...args),
}));

const mockNotFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("next/navigation", () => ({
  notFound: mockNotFound,
}));

const mockRequestData = {
  request: {
    request_uuid: "req-abc-123",
    company_id: 42,
    contact_uuid: "contact-001",
    staff_id: 5,
    request_position_title: "Senior Full Stack Developer",
    request_job_description: "Building next-gen platform features.",
    request_compensation: "1500 KWD/month",
    request_number_of_employees: 2,
    request_location: "Kuwait City",
    request_additional_info: "Remote-friendly after probation",
    request_status: "In Progress",
    request_feedback: null,
    request_created_datetime: new Date("2026-01-15"),
    request_updated_datetime: new Date("2026-06-10"),
    company_name: "Tech Corp",
    company: { company_name: "Tech Corp" },
    contact: { contact_name: "Ahmed Al-Sabah" },
    staff: { staff_name: "Staff User" },
  },
  metrics: [
    { label: "Applications", value: 8, note: "Candidates applied" },
    { label: "Invitations", value: 15, note: "Invitations sent" },
  ],
  applications: [
    { id: "app-1", title: "John D.", subtitle: "Applied 2026-02-01" },
    { id: "app-2", title: "Sarah K.", subtitle: "Applied 2026-02-15" },
  ],
  invitations: [
    { id: "inv-1", title: "Ali M.", subtitle: "Invited 2026-01-20" },
  ],
  interviews: [
    { id: "int-1", title: "John D. - Technical", subtitle: "2026-03-01" },
    { id: "int-2", title: "Sarah K. - HR", subtitle: "2026-03-05" },
  ],
  stories: [
    { id: "story-1", title: "Position created", subtitle: "2026-01-15" },
  ],
};

describe("CompanyRequestDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders request detail with correct eyebrow and title", async () => {
    mockGetCompanyRequestDetail.mockResolvedValue(mockRequestData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "req-abc-123" }) }));

    expect(screen.getByTestId("workspace-shell")).toBeDefined();
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Company / Request");
    expect(screen.getByTestId("title")).toHaveTextContent("Senior Full Stack Developer");
  });

  it("renders request metrics", async () => {
    mockGetCompanyRequestDetail.mockResolvedValue(mockRequestData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "req-abc-123" }) }));

    expect(screen.getByTestId("metric-Applications")).toHaveTextContent("8");
    expect(screen.getByTestId("metric-Invitations")).toHaveTextContent("15");
  });

  it("renders primary and secondary sections", async () => {
    mockGetCompanyRequestDetail.mockResolvedValue(mockRequestData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "req-abc-123" }) }));

    expect(screen.getByTestId("primary-section")).toHaveTextContent("Applications");
    expect(screen.getByTestId("secondary-section")).toHaveTextContent("Invitations");
  });

  it("renders Request Brief detail section with facts", async () => {
    mockGetCompanyRequestDetail.mockResolvedValue(mockRequestData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "req-abc-123" }) }));

    const sections = screen.getAllByTestId("section-title");
    expect(sections[0]).toHaveTextContent("Request Brief");
    expect(screen.getByTestId("fact-Compensation")).toHaveTextContent("1500 KWD/month");
    expect(screen.getByTestId("fact-Location")).toHaveTextContent("Kuwait City");
  });

  it("renders list-type detail sections for interviews and stories", async () => {
    mockGetCompanyRequestDetail.mockResolvedValue(mockRequestData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "req-abc-123" }) }));

    expect(screen.getByTestId("list-rows-Interviews")).toHaveTextContent("2 items");
    expect(screen.getByTestId("list-rows-Stories")).toHaveTextContent("1 items");
  });

  it("shows fallback title when position title is null", async () => {
    mockGetCompanyRequestDetail.mockResolvedValue({
      ...mockRequestData,
      request: { ...mockRequestData.request, request_position_title: null },
    });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "req-null-title" }) }));

    expect(screen.getByTestId("title")).toHaveTextContent("Untitled request");
  });

  it("calls notFound when request is null", async () => {
    mockGetCompanyRequestDetail.mockResolvedValue(null);

    const Page = (await import("./page")).default;
    await expect(
      Page({ params: Promise.resolve({ id: "nonexistent" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalledOnce();
  });

  it("calls notFound when request data lacks request field", async () => {
    mockGetCompanyRequestDetail.mockResolvedValue({ metrics: [], applications: [], interviews: [], stories: [] });

    const Page = (await import("./page")).default;
    await expect(
      Page({ params: Promise.resolve({ id: "no-request" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalledOnce();
  });
});
