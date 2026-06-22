import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";

// Mock dependencies
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({
    user: { id: "1" },
    role: "candidate",
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
          {m.value}
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
  }: {
    title: string;
    facts: { label: string; value: string | React.ReactNode }[];
  }) => (
    <div data-testid="detail-section">
      <div data-testid="section-title">{title}</div>
      {facts.map((f) => (
        <span key={String(f.label)} data-testid={`fact-${f.label}`}>
          {String(f.value)}
        </span>
      ))}
    </div>
  ),
}));

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date) => d.toISOString().split("T")[0],
}));

vi.mock("@/modules/candidates/WorkLogAppealForm", () => ({
  WorkLogAppealForm: ({ workLogUuid }: { workLogUuid: string }) => (
    <div data-testid="work-log-appeal-form" data-uuid={workLogUuid} />
  ),
}));

const mockGetCandidateWorkLogDetail = vi.fn();
const mockGetWorkLogAppeals = vi.fn();
const mockGetWorkLogFeedback = vi.fn();

vi.mock("./actions", () => ({
  getCandidateWorkLogDetail: (...args: unknown[]) =>
    mockGetCandidateWorkLogDetail(...args),
  getWorkLogAppeals: (...args: unknown[]) => mockGetWorkLogAppeals(...args),
  getWorkLogFeedback: (...args: unknown[]) => mockGetWorkLogFeedback(...args),
}));

const mockNotFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("next/navigation", () => ({
  notFound: mockNotFound,
}));

const mockWorkLogData = {
  candidate_working_hour_uuid: "wl-abc-123",
  store_name: "Main Branch",
  company_name: "Tech Corp",
  store_location: "Floor 2",
  date: new Date("2025-06-01"),
  start_time: new Date("2025-06-01T09:00:00"),
  end_time: new Date("2025-06-01T17:00:00"),
  total_time: 480,
  status: 1,
  via: "system",
  note: "Regular shift",
};

const mockAppealsData = [
  {
    appeal_uuid: "ap-001",
    reason: "Time discrepancy",
    status: 1,
    created_at: new Date("2025-06-02"),
  },
];

const mockFeedbackData = [
  {
    cwlf_uuid: "fb-001",
    note: "Good work",
    reason: null,
    status: 1,
    rating: true,
    created_at: new Date("2025-06-02"),
  },
];

describe("CandidateWorkLogDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetWorkLogAppeals.mockResolvedValue(mockAppealsData);
    mockGetWorkLogFeedback.mockResolvedValue(mockFeedbackData);
  });

  afterEach(() => {
    cleanup();
  });

  it("renders work log detail with WorkspaceShell and correct eyebrow", async () => {
    mockGetCandidateWorkLogDetail.mockResolvedValue(mockWorkLogData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "wl-abc-123" }) }));

    expect(screen.getByTestId("workspace-shell")).toBeDefined();
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Candidate / Work Log");
    expect(screen.getByTestId("title")).toHaveTextContent("Main Branch · 2025-06-01");
  });

  it("renders metrics correctly", async () => {
    mockGetCandidateWorkLogDetail.mockResolvedValue(mockWorkLogData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "wl-abc-123" }) }));

    expect(screen.getByTestId("metric-Total")).toHaveTextContent("480 minutes");
    expect(screen.getByTestId("metric-Status")).toHaveTextContent("Status 1");
    expect(screen.getByTestId("metric-Appeals")).toHaveTextContent("1");
    expect(screen.getByTestId("metric-Feedback")).toHaveTextContent("1");
  });

  it("renders DetailSection with Shift Record facts", async () => {
    mockGetCandidateWorkLogDetail.mockResolvedValue(mockWorkLogData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "wl-abc-123" }) }));

    expect(screen.getByTestId("detail-section")).toBeDefined();
    expect(screen.getByTestId("section-title")).toHaveTextContent("Shift Record");
    expect(screen.getByTestId("fact-Company")).toHaveTextContent("Tech Corp");
    expect(screen.getByTestId("fact-Store")).toHaveTextContent("Main Branch");
    expect(screen.getByTestId("fact-Store Location")).toHaveTextContent("Floor 2");
    expect(screen.getByTestId("fact-Note")).toHaveTextContent("Regular shift");
  });

  it("renders WorkLogAppealForm with correct uuid", async () => {
    mockGetCandidateWorkLogDetail.mockResolvedValue(mockWorkLogData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "wl-abc-123" }) }));

    expect(screen.getByTestId("work-log-appeal-form")).toBeDefined();
    expect(screen.getByTestId("work-log-appeal-form")).toHaveAttribute(
      "data-uuid",
      "wl-abc-123"
    );
  });

  it("shows fallback title when store_name is null", async () => {
    mockGetCandidateWorkLogDetail.mockResolvedValue({
      ...mockWorkLogData,
      store_name: null,
    });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "wl-456" }) }));

    expect(screen.getByTestId("title")).toHaveTextContent("Work log · 2025-06-01");
  });

  it("shows 'N/A' when date is null", async () => {
    mockGetCandidateWorkLogDetail.mockResolvedValue({
      ...mockWorkLogData,
      date: null,
    });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "wl-789" }) }));

    expect(screen.getByTestId("title")).toHaveTextContent("Main Branch · N/A");
  });

  it("shows 'N/A' when times are null", async () => {
    mockGetCandidateWorkLogDetail.mockResolvedValue({
      ...mockWorkLogData,
      start_time: null,
      end_time: null,
    });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "wl-000" }) }));

    expect(screen.getByTestId("fact-Start")).toHaveTextContent("N/A");
    expect(screen.getByTestId("fact-End")).toHaveTextContent("N/A");
  });

  it("shows empty appeals count with 0-length appeals", async () => {
    mockGetCandidateWorkLogDetail.mockResolvedValue(mockWorkLogData);
    mockGetWorkLogAppeals.mockResolvedValue([]);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "wl-no-appeals" }) }));

    expect(screen.getByTestId("metric-Appeals")).toHaveTextContent("0");
  });

  it("calls notFound when getCandidateWorkLogDetail returns null", async () => {
    mockGetCandidateWorkLogDetail.mockResolvedValue(null);

    const Page = (await import("./page")).default;
    await expect(
      Page({ params: Promise.resolve({ id: "nonexistent" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalledOnce();
  });
});
