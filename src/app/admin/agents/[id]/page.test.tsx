import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";

// Mock dependencies
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
          {typeof f.value === "string" ? f.value : "node"}
        </span>
      ))}
    </div>
  ),
}));

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date) => d.toISOString().split("T")[0],
}));

const mockAgent = {
  id: "agent_uuid_123",
  name: "Test Agent",
  role: "qa",
  status: "running",
  title: "QA Engineer",
  icon: "robot",
  reportsTo: "CTO",
  lastHeartbeatAt: "2024-03-15T14:30:00.000Z",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-03-15T14:30:00.000Z",
  pauseReason: null,
  heartbeatRuns24h: 48,
  heartbeatRunsSucceeded: 44,
  heartbeatRunsFailed: 4,
  heartbeatSuccessRate: 91,
  issuesDone7d: 12,
  issuesInProgress: 3,
  lastRunStatus: "succeeded",
  lastRunStartedAt: "2024-03-15T14:00:00.000Z",
  lastRunError: null,
};

const mockGetAgentById = vi.fn();

vi.mock("./actions", () => ({
  getAgentById: (...args: unknown[]) => mockGetAgentById(...args),
}));

describe("AdminAgentDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders agent detail with all fields", async () => {
    mockGetAgentById.mockResolvedValue({ agent: mockAgent });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "11111111-1111-1111-1111-111111111111" }),
      }),
    );

    // Check workspace shell
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Agents");
    expect(screen.getByTestId("title")).toHaveTextContent("Test Agent");

    // Check metrics
    expect(screen.getByTestId("metric-Status")).toHaveTextContent("running");
    expect(screen.getByTestId("metric-Heartbeat Runs (24h)")).toHaveTextContent("48");
    expect(screen.getByTestId("metric-Success Rate")).toHaveTextContent("91%");
    expect(screen.getByTestId("metric-Issues Done (7d)")).toHaveTextContent("12");

    // Check detail fields
    expect(screen.getByTestId("fact-Name")).toHaveTextContent("Test Agent");
    expect(screen.getByTestId("fact-Role")).toHaveTextContent("qa");
    expect(screen.getByTestId("fact-Title")).toHaveTextContent("QA Engineer");
    expect(screen.getByTestId("fact-Icon")).toHaveTextContent("robot");
    expect(screen.getByTestId("fact-Reports To")).toHaveTextContent("CTO");
    expect(screen.getByTestId("fact-Last Heartbeat")).toHaveTextContent("2024-03-15");

    // Check sections
    expect(screen.getByText("Agent Details")).toBeInTheDocument();
    expect(screen.getByText("Heartbeat Performance")).toBeInTheDocument();
    expect(screen.getByText("Issue Performance")).toBeInTheDocument();

    // Check back button
    expect(screen.getByText("Back to Agents")).toBeInTheDocument();
  });

  it("renders null optional fields as em-dash", async () => {
    mockGetAgentById.mockResolvedValue({
      agent: { ...mockAgent, title: null, icon: null, reportsTo: null, pauseReason: null, lastHeartbeatAt: null, lastRunStatus: null, lastRunStartedAt: null, lastRunError: null },
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "00000000-0000-0000-0000-000000000000" }),
      }),
    );

    expect(screen.getByTestId("fact-Title")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Icon")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Reports To")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Last Heartbeat")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Last Run Error")).toHaveTextContent("—");
  });

  it("calls notFound when agent is null", async () => {
    mockGetAgentById.mockResolvedValue({ agent: null });

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "22222222-2222-2222-2222-222222222222" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
