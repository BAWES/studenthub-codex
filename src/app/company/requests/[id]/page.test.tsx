import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({
    user: { id: "42" },
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
    primary: { title: string; rows: { id: string; title: string; subtitle: string; meta: string }[] };
    secondary: { title: string; rows: { id: string; title: string; subtitle: string; meta: string }[] };
  }) => (
    <div data-testid="workspace-shell">
      <div data-testid="eyebrow">{eyebrow}</div>
      <div data-testid="title">{title}</div>
      {metrics.map((m) => (
        <span key={m.label} data-testid={`metric-${m.label}`}>
          {m.value}
        </span>
      ))}
      <div data-testid="primary-title">{primary.title}</div>
      {primary.rows.map((r) => (
        <span key={r.id} data-testid={`primary-${r.id}`}>
          {r.title}
        </span>
      ))}
      <div data-testid="secondary-title">{secondary.title}</div>
      {secondary.rows.map((r) => (
        <span key={r.id} data-testid={`secondary-${r.id}`}>
          {r.title}
        </span>
      ))}
      {children}
    </div>
  ),
}));

vi.mock("@/modules/workspace/DetailPanels", () => ({
  DetailSection: ({
  title,
  facts,
  type,
  }: {
  title: string;
  facts?: { label: string; value: string | React.ReactNode }[];
  type?: string;
  }) => (
  <div data-testid={`detail-section${type ? `-${type}` : ""}`}>
    <div data-testid="section-title">{title}</div>
    {facts?.map((f) => {
      const v =
        f.value === null || f.value === undefined
          ? ""
          : typeof f.value === "string"
            ? f.value
            : "node";
      return (
        <span key={String(f.label)} data-testid={`fact-${f.label}`}>
          {v}
        </span>
      );
    })}
  </div>
  ),
}));

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date | null) =>
    d ? d.toISOString().split("T")[0] : "N/A",
}));

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

const mockGetCompanyRequestDetail = vi.fn();

vi.mock("./actions", () => ({
  getCompanyRequestDetail: (...args: unknown[]) =>
    mockGetCompanyRequestDetail(...args),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const fullRequestDetail = {
  request: {
    request_uuid: "req-abc-123",
    request_position_title: "Senior Store Manager",
    request_compensation: "1,200 KWD/month",
    request_location: "The Avenues Mall, Kuwait City",
    request_created_datetime: new Date("2026-05-10T09:00:00Z"),
    request_updated_datetime: new Date("2026-06-01T14:00:00Z"),
    company: { company_name: "Alshaya Group" },
    contact: { contact_name: "Ahmed Al-Mutawa" },
    staff: { staff_name: "Noor Al-Jassem" },
  },
  metrics: [
    { label: "Candidates", value: "8", note: "Applied" },
    { label: "Interviews", value: "3", note: "Scheduled" },
    { label: "Offers", value: "1", note: "Pending" },
  ],
  applications: [
    {
      id: "app-1",
      title: "Candidate #1042",
      subtitle: "Applied 2 days ago",
      meta: "Stage: Screening",
    },
  ],
  invitations: [
    {
      id: "inv-1",
      title: "Invitation sent to Candidate #983",
      subtitle: "Sent 1 week ago",
      meta: "Pending response",
    },
  ],
  interviews: [
    { id: "int-1", title: "First round", subtitle: "Jun 15, 2026", meta: "Online" },
  ],
  stories: [
    { id: "st-1", title: "Client request received", subtitle: "May 10, 2026", meta: "Noor" },
  ],
};

const nullRequestDetail = {
  request: null,
  metrics: [],
  applications: [],
  invitations: [],
  interviews: [],
  stories: [],
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CompanyRequestDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders request detail with full data", async () => {
    mockGetCompanyRequestDetail.mockResolvedValue(fullRequestDetail);

    const Page = (await import("./page")).default;
    render(
      await Page({ params: Promise.resolve({ id: "req-abc-123" }) }),
    );

    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Company / Request");
    expect(screen.getByTestId("title")).toHaveTextContent("Senior Store Manager");

    // Request Brief section (first detail-section)
    const sections = screen.getAllByTestId("section-title");
    expect(sections[0]).toHaveTextContent("Request Brief");
    expect(screen.getByTestId("fact-Company")).toHaveTextContent("Alshaya Group");
    expect(screen.getByTestId("fact-Contact")).toHaveTextContent("Ahmed Al-Mutawa");
    expect(screen.getByTestId("fact-Owner")).toHaveTextContent("Noor Al-Jassem");
    expect(screen.getByTestId("fact-Compensation")).toHaveTextContent("1,200 KWD/month");
    expect(screen.getByTestId("fact-Location")).toHaveTextContent("The Avenues Mall, Kuwait City");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("2026-05-10");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("2026-06-01");

    // Metrics
    expect(screen.getByTestId("metric-Candidates")).toHaveTextContent("8");
    expect(screen.getByTestId("metric-Interviews")).toHaveTextContent("3");

    // Primary list (Applications)
    expect(screen.getByTestId("primary-title")).toHaveTextContent("Applications");
    expect(screen.getByTestId("primary-app-1")).toHaveTextContent("Candidate #1042");

    // Secondary list (Invitations)
    expect(screen.getByTestId("secondary-title")).toHaveTextContent("Invitations");
    expect(screen.getByTestId("secondary-inv-1")).toHaveTextContent("Invitation sent to Candidate #983");
  });

  it("renders with null title fallback", async () => {
    const nullTitle = {
      ...fullRequestDetail,
      request: {
        ...fullRequestDetail.request,
        request_position_title: null,
      },
    };
    mockGetCompanyRequestDetail.mockResolvedValue(nullTitle);

    const Page = (await import("./page")).default;
    render(
      await Page({ params: Promise.resolve({ id: "req-null-title" }) }),
    );

    expect(screen.getByTestId("title")).toHaveTextContent("Untitled request");
  });

  it("renders with null nested objects gracefully", async () => {
    const nullNested = {
      ...fullRequestDetail,
      request: {
        ...fullRequestDetail.request,
        company: null,
        contact: null,
        staff: null,
        request_compensation: null,
        request_location: null,
      },
    };
    mockGetCompanyRequestDetail.mockResolvedValue(nullNested);

    const Page = (await import("./page")).default;
    render(
      await Page({ params: Promise.resolve({ id: "req-null-nested" }) }),
    );

    expect(screen.getByTestId("fact-Company")).toBeEmptyDOMElement();
    expect(screen.getByTestId("fact-Contact")).toBeEmptyDOMElement();
    expect(screen.getByTestId("fact-Owner")).toBeEmptyDOMElement();
    expect(screen.getByTestId("fact-Compensation")).toBeEmptyDOMElement();
    expect(screen.getByTestId("fact-Location")).toBeEmptyDOMElement();
  });

  it("calls getCompanyRequestDetail with the ID from params", async () => {
    mockGetCompanyRequestDetail.mockResolvedValue(fullRequestDetail);

    const Page = (await import("./page")).default;
    render(
      await Page({ params: Promise.resolve({ id: "req-custom-id" }) }),
    );

    expect(mockGetCompanyRequestDetail).toHaveBeenCalledWith("req-custom-id");
  });

  it("calls notFound when request is null", async () => {
    mockGetCompanyRequestDetail.mockResolvedValue(nullRequestDetail);

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "nonexistent" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("calls notFound when data is null", async () => {
    mockGetCompanyRequestDetail.mockResolvedValue(null);

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "nonexistent" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
