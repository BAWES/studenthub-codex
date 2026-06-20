import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";

// Mock the dependencies
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({ user: { id: "1" }, role: "staff" }),
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
          {typeof f.value === "object" ? f.value : String(f.value)}
        </span>
      ))}
    </div>
  ),
}));

const mockGetStaffInterviewDetail = vi.fn();
const mockUpdateInterviewStatusAction = vi.fn();

vi.mock("../actions", () => ({
  getStaffInterviewDetail: (...args: unknown[]) => mockGetStaffInterviewDetail(...args),
}));

vi.mock("@/modules/requests/interview-actions", () => ({
  updateInterviewStatusAction: (...args: unknown[]) => mockUpdateInterviewStatusAction(...args),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockFullInterview = {
  interviewUuid: "550e8400-e29b-41d4-a716-446655440000",
  candidateName: "Alice Johnson",
  candidateEmail: "alice@example.com",
  candidatePhone: "+965-5000-0000",
  candidateId: 42,
  requestTitle: "Software Engineer",
  requestUuid: "req-123",
  companyName: "Tech Corp",
  scheduledAt: new Date("2026-06-15T10:00:00Z"),
  status: 0,
  interviewNote: "Strong technical skills",
  note: "Follow up with HR",
  staffName: "Bob Smith",
  createdAt: new Date("2026-06-10T08:00:00Z"),
  updatedAt: null,
};

describe("StaffInterviewDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders interview detail with all fields", async () => {
    mockGetStaffInterviewDetail.mockResolvedValue(mockFullInterview);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "550e8400-e29b-41d4-a716-446655440000" }),
        searchParams: Promise.resolve({}),
      }),
    );

    // Workspace shell
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Staff / Interviews");
    expect(screen.getByTestId("title")).toHaveTextContent("Alice Johnson");

    // Detail facts
    expect(screen.getByTestId("fact-Candidate")).toHaveTextContent("Alice Johnson");
    expect(screen.getByTestId("fact-Email")).toHaveTextContent("alice@example.com");
    expect(screen.getByTestId("fact-Phone")).toHaveTextContent("+965-5000-0000");
    expect(screen.getByTestId("fact-Request")).toHaveTextContent("Software Engineer");
    expect(screen.getByTestId("fact-Company")).toHaveTextContent("Tech Corp");
    expect(screen.getByTestId("fact-Status")).toHaveTextContent("Scheduled");
    expect(screen.getByTestId("fact-Staff")).toHaveTextContent("Bob Smith");
    expect(screen.getByTestId("fact-Internal Note")).toHaveTextContent("Follow up with HR");
    expect(screen.getByTestId("fact-Interview Note")).toHaveTextContent("Strong technical skills");

    // Action buttons
    expect(screen.getByText("Mark Completed")).toBeInTheDocument();
    expect(screen.getByText("Mark Cancelled")).toBeInTheDocument();
    expect(screen.getByText("View Candidate")).toBeInTheDocument();
    expect(screen.getByText("View Request")).toBeInTheDocument();
    expect(screen.getByText("Back to Interviews")).toBeInTheDocument();
  });

  it("renders with all nullable fields as null", async () => {
    mockGetStaffInterviewDetail.mockResolvedValue({
      interviewUuid: "550e8400-e29b-41d4-a716-446655440001",
      candidateName: null,
      candidateEmail: null,
      candidatePhone: null,
      candidateId: null,
      requestTitle: null,
      requestUuid: null,
      companyName: null,
      scheduledAt: null,
      status: null,
      interviewNote: null,
      note: null,
      staffName: null,
      createdAt: null,
      updatedAt: null,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "550e8400-e29b-41d4-a716-446655440001" }),
        searchParams: Promise.resolve({}),
      }),
    );

    expect(screen.getByTestId("title")).toHaveTextContent("Interview Detail");
    expect(screen.getByTestId("fact-Candidate")).toHaveTextContent("null");
    expect(screen.getByTestId("fact-Email")).toHaveTextContent("null");
    expect(screen.getByTestId("fact-Phone")).toHaveTextContent("null");
    expect(screen.getByTestId("fact-Status")).toHaveTextContent("Scheduled");
    expect(screen.queryByText("Reset to Scheduled")).not.toBeInTheDocument();
    expect(screen.getByText("Back to Interviews")).toBeInTheDocument();
  });

  it("renders completed status", async () => {
    mockGetStaffInterviewDetail.mockResolvedValue({
      ...mockFullInterview,
      status: 1,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "completed-uuid" }),
        searchParams: Promise.resolve({}),
      }),
    );

    expect(screen.getByTestId("fact-Status")).toHaveTextContent("Completed");
    expect(screen.getByText("Mark Cancelled")).toBeInTheDocument();
    expect(screen.queryByText("Mark Completed")).not.toBeInTheDocument();
  });

  it("renders cancelled status", async () => {
    mockGetStaffInterviewDetail.mockResolvedValue({
      ...mockFullInterview,
      status: 2,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "cancelled-uuid" }),
        searchParams: Promise.resolve({}),
      }),
    );

    expect(screen.getByTestId("fact-Status")).toHaveTextContent("Cancelled");
    expect(screen.getByText("Mark Completed")).toBeInTheDocument();
    expect(screen.queryByText("Mark Cancelled")).not.toBeInTheDocument();
    expect(screen.getByText("Reset to Scheduled")).toBeInTheDocument();
  });

  it("renders without candidate/request links when IDs are null", async () => {
    mockGetStaffInterviewDetail.mockResolvedValue({
      ...mockFullInterview,
      candidateId: null,
      requestUuid: null,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "no-links-uuid" }),
        searchParams: Promise.resolve({}),
      }),
    );

    expect(screen.queryByText("View Candidate")).not.toBeInTheDocument();
    expect(screen.queryByText("View Request")).not.toBeInTheDocument();
    expect(screen.getByText("Back to Interviews")).toBeInTheDocument();
  });

  it("renders notice when notice param is provided", async () => {
    mockGetStaffInterviewDetail.mockResolvedValue(mockFullInterview);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "notice-uuid" }),
        searchParams: Promise.resolve({ notice: "interview-updated" }),
      }),
    );

    expect(screen.getByText("Interview updated successfully.")).toBeInTheDocument();
  });

  it("calls notFound when interview is null", async () => {
    mockGetStaffInterviewDetail.mockResolvedValue(null);

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "nonexistent" }), searchParams: Promise.resolve({}) }),
    ).rejects.toThrow();

    expect(notFound).toHaveBeenCalled();
  });
});
