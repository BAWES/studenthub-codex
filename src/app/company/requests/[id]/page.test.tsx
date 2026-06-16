import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";

// Mock dependencies
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({
    user: { id: "1" },
    role: "company",
  }),
}));

vi.mock("@/modules/workspace/ErrorBoundary", () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/modules/workspace/WorkspaceShell", () => {
  type Row = { id: string; title: string; subtitle: string; meta?: string };
  type Metric = { label: string; value: string | number; note: string };
  return {
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
      metrics: Metric[];
      primary?: { title: string; rows: Row[] };
      secondary?: { title: string; rows: Row[] };
    }) => (
      <div data-testid="workspace-shell">
        <div data-testid="eyebrow">{eyebrow}</div>
        <div data-testid="title">{title}</div>
        {metrics.map((m) => (
          <span key={m.label} data-testid={`metric-${m.label}`}>
            {m.value}
          </span>
        ))}
        {primary ? (
          <div data-testid="primary-section">
            <div data-testid="primary-title">{primary.title}</div>
            {primary.rows.map((r) => (
              <span key={r.id} data-testid={`primary-row-${r.id}`}>
                {r.title}
              </span>
            ))}
          </div>
        ) : null}
        {secondary ? (
          <div data-testid="secondary-section">
            <div data-testid="secondary-title">{secondary.title}</div>
            {secondary.rows.map((r) => (
              <span key={r.id} data-testid={`secondary-row-${r.id}`}>
                {r.title}
              </span>
            ))}
          </div>
        ) : null}
        {children}
      </div>
    ),
  };
});

vi.mock("@/modules/workspace/DetailPanels", () => ({
  DetailSection: ({
    title,
    facts,
    type,
    rows,
  }: {
    title: string;
    facts?: { label: string; value: string | React.ReactNode }[];
    type?: "list";
    rows?: { id: string; title: string; subtitle: string; meta?: string }[];
  }) => {
    if (type === "list" && rows) {
      return (
        <div data-testid="list-section">
          <div data-testid={`list-title-${title}`}>{title}</div>
          {rows.map((r) => (
            <span key={r.id} data-testid={`list-row-${title}-${r.id}`}>
              {r.title}
            </span>
          ))}
        </div>
      );
    }
    return (
      <div data-testid="detail-section">
        <div data-testid="section-title">{title}</div>
        {facts?.map((f) => (
          <span key={String(f.label)} data-testid={`fact-${f.label}`}>
            {String(f.value)}
          </span>
        ))}
      </div>
    );
  },
}));

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date | string) =>
    typeof d === "string" ? d.split("T")[0] : d.toISOString().split("T")[0],
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

const baseDate = new Date("2025-01-15");
const baseDateStr = baseDate.toISOString();
const updatedDateStr = new Date("2025-03-10").toISOString();

const mockRequestDetailData = {
  request: {
    request_uuid: "req-uuid-1",
    request_position_title: "Senior Developer",
    request_job_description: "Looking for a senior dev",
    request_compensation: "1,500 KWD/month",
    request_number_of_employees: 3,
    request_location: "Kuwait City",
    request_additional_info: null,
    request_status: "Open",
    request_priority: 1,
    request_created_datetime: baseDate,
    request_updated_datetime: new Date("2025-03-10"),
    request_started_at: null,
    request_finished_at: null,
    company: { company_id: 10, company_name: "Tech Corp", company_email: "hr@techcorp.kw", currency_code: "KWD" },
    contact: { contact_name: "John Doe", contact_email: "john@techcorp.kw" },
    staff: { staff_name: "Staff Ahmed", staff_email: "ahmed@staff.kw" },
  },
  requestSkills: ["React", "Node.js", "TypeScript"],
  requestSummary: "Looking for a senior dev",
  suggestionEmailHref: "mailto:john@techcorp.kw?subject=Candidates%20for%20Senior%20Developer",
  pipeline: [
    { id: "matches", label: "Matches", value: 5, note: "Skill-fit candidates" },
    { id: "suggestions", label: "Suggested", value: 3, note: "Employer-ready candidates" },
  ],
  metrics: [
    { label: "Seats", value: 3, note: "Requested employees" },
    { label: "Status", value: "Open", note: "Priority 1" },
    { label: "Suggestions", value: 3, note: "Recent suggestions shown" },
    { label: "Invitations", value: 2, note: "Recent invitations shown" },
  ],
  matchedCandidates: [],
  applications: [
    { id: "app-1", title: "Ali Hassan", subtitle: "ali@email.com", meta: "Status 1 · 2025-01-20", status: 1, href: "/app/companies?candidate=100" },
  ],
  interviews: [{ id: "int-1", title: "Sara Khalid", subtitle: "sara@email.com", meta: "Status 0 · 2025-02-01", status: 0 }],
  invitations: [{ id: "inv-1", title: "Noor Ahmad", subtitle: "noor@email.com", meta: "Status 1 · 2025-01-25", status: 1 }],
  suggestions: [{ id: "sug-1", title: "Fahad Ali", subtitle: "Good fit", meta: "Status 1 · Mailed · 2025-01-10" }],
  activities: [{ id: "act-1", title: "Staff Ahmed", subtitle: "Created request", meta: "2025-01-15" }],
  notes: [{ id: "note-1", title: "Internal Note", subtitle: "Waiting for approval", meta: "2025-01-16" }],
  stories: [{ id: "story-1", title: "Story story-1-slice", subtitle: "Status 1", meta: "2025-02-01", status: 1 }],
};

describe("CompanyRequestDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders request detail with WorkspaceShell and correct eyebrow/title", async () => {
    mockGetCompanyRequestDetail.mockResolvedValue(mockRequestDetailData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "req-uuid-1" }) }));

    expect(screen.getByTestId("workspace-shell")).toBeDefined();
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Company / Request");
    expect(screen.getByTestId("title")).toHaveTextContent("Senior Developer");
  });

  it("renders metrics correctly", async () => {
    mockGetCompanyRequestDetail.mockResolvedValue(mockRequestDetailData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "req-uuid-1" }) }));

    expect(screen.getByTestId("metric-Seats")).toHaveTextContent("3");
    expect(screen.getByTestId("metric-Status")).toHaveTextContent("Open");
    expect(screen.getByTestId("metric-Suggestions")).toHaveTextContent("3");
    expect(screen.getByTestId("metric-Invitations")).toHaveTextContent("2");
  });

  it("renders primary (Applications) and secondary (Invitations) sections", async () => {
    mockGetCompanyRequestDetail.mockResolvedValue(mockRequestDetailData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "req-uuid-1" }) }));

    expect(screen.getByTestId("primary-title")).toHaveTextContent("Applications");
    expect(screen.getByTestId("primary-row-app-1")).toHaveTextContent("Ali Hassan");
    expect(screen.getByTestId("secondary-title")).toHaveTextContent("Invitations");
    expect(screen.getByTestId("secondary-row-inv-1")).toHaveTextContent("Noor Ahmad");
  });

  it("renders DetailSection with Request Brief facts", async () => {
    mockGetCompanyRequestDetail.mockResolvedValue(mockRequestDetailData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "req-uuid-1" }) }));

    expect(screen.getByTestId("section-title")).toHaveTextContent("Request Brief");
    expect(screen.getByTestId("fact-Company")).toHaveTextContent("Tech Corp");
    expect(screen.getByTestId("fact-Contact")).toHaveTextContent("John Doe");
    expect(screen.getByTestId("fact-Owner")).toHaveTextContent("Staff Ahmed");
    expect(screen.getByTestId("fact-Compensation")).toHaveTextContent("1,500 KWD/month");
    expect(screen.getByTestId("fact-Location")).toHaveTextContent("Kuwait City");
    expect(screen.getByTestId("fact-Created")).toBeDefined();
    expect(screen.getByTestId("fact-Updated")).toBeDefined();
  });

  it("renders list sections for Interviews and Stories", async () => {
    mockGetCompanyRequestDetail.mockResolvedValue(mockRequestDetailData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "req-uuid-1" }) }));

    expect(screen.getByTestId("list-title-Interviews")).toHaveTextContent("Interviews");
    expect(screen.getByTestId("list-row-Interviews-int-1")).toHaveTextContent("Sara Khalid");
    expect(screen.getByTestId("list-title-Stories")).toHaveTextContent("Stories");
  });

  it("uses fallback title for null request_position_title", async () => {
    mockGetCompanyRequestDetail.mockResolvedValue({
      ...mockRequestDetailData,
      request: { ...mockRequestDetailData.request, request_position_title: null },
    });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "req-uuid-1" }) }));

    expect(screen.getByTestId("title")).toHaveTextContent("Untitled request");
  });

  it("calls notFound when data.request is null", async () => {
    mockGetCompanyRequestDetail.mockResolvedValue({ ...mockRequestDetailData, request: null });

    const Page = (await import("./page")).default;
    await expect(
      Page({ params: Promise.resolve({ id: "nonexistent" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalledOnce();
  });

  it("calls notFound when data is null", async () => {
    mockGetCompanyRequestDetail.mockResolvedValue(null);

    const Page = (await import("./page")).default;
    await expect(
      Page({ params: Promise.resolve({ id: "nonexistent" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalledOnce();
  });
});
