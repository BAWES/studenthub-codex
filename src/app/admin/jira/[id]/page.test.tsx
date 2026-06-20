import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({ user: { id: "1" }, role: "admin" }),
  requireCapability: vi.fn().mockResolvedValue(undefined),
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

const mockIssue = {
  id: "10001",
  key: "PROJ-123",
  summary: "Fix login page CSS issue",
  status: "In Progress",
  assignee: {
    displayName: "John Doe",
    emailAddress: "john@example.com",
  },
  created: "2024-03-01T10:00:00.000Z",
  updated: "2024-03-05T14:30:00.000Z",
};

const mockGetJiraIssue = vi.fn();

vi.mock("./actions", () => ({
  getJiraIssue: (...args: unknown[]) => mockGetJiraIssue(...args),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

describe("AdminJiraIssueDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders Jira issue detail with all fields", async () => {
    mockGetJiraIssue.mockResolvedValue(mockIssue);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "PROJ-123" }),
      }),
    );

    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Jira");
    expect(screen.getByTestId("title")).toHaveTextContent("Jira Issue — PROJ-123");

    expect(screen.getByTestId("metric-Key")).toHaveTextContent("PROJ-123");
    expect(screen.getByTestId("metric-Summary")).toHaveTextContent("Fix login page CSS issue");
    expect(screen.getByTestId("metric-Status")).toHaveTextContent("In Progress");

    expect(screen.getByTestId("fact-ID")).toHaveTextContent("10001");
    expect(screen.getByTestId("fact-Key")).toHaveTextContent("PROJ-123");
    expect(screen.getByTestId("fact-Summary")).toHaveTextContent("Fix login page CSS issue");
    expect(screen.getByTestId("fact-Status")).toHaveTextContent("In Progress");
    expect(screen.getByTestId("fact-Assignee")).toHaveTextContent("John Doe");
    expect(screen.getByTestId("fact-Assignee Email")).toHaveTextContent("john@example.com");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("2024-03-01T10:00:00.000Z");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("2024-03-05T14:30:00.000Z");

    expect(screen.getByText("Back to Jira Issues")).toBeInTheDocument();
  });

  it("renders with nullable fields as dash or Unassigned", async () => {
    mockGetJiraIssue.mockResolvedValue({
      ...mockIssue,
      summary: null,
      status: null,
      assignee: null,
      created: null,
      updated: null,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "PROJ-NULL" }),
      }),
    );

    expect(screen.getByTestId("metric-Summary")).toHaveTextContent("—");
    expect(screen.getByTestId("metric-Status")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Summary")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Status")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Assignee")).toHaveTextContent("Unassigned");
    expect(screen.getByTestId("fact-Assignee Email")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("—");
  });

  it("calls notFound when issue is null", async () => {
    mockGetJiraIssue.mockResolvedValue(null);

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "nonexistent" }) }),
    ).rejects.toThrow();

    expect(notFound).toHaveBeenCalled();
  });
});
