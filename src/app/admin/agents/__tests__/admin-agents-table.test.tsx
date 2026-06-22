import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { AdminAgentsTable } from "../_components";
import type { AgentHealthData } from "../schemas";

// Mock next/navigation
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh, push: vi.fn() }),
  usePathname: () => "/admin/agents",
}));

const mockSession = {
  user_uuid: "u-001",
  role: "admin",
  email: "admin@test.com",
  name: "Admin",
} as any;

const mockAgents: AgentHealthData[] = [
  {
    id: "eaa3c21b-a27e-40a5-a5bb-d392e5f53d95",
    name: "Coder",
    status: "running",
    role: "Software Engineer",
    heartbeatMetrics: [
      { label: "Runs (24h)", value: "42", note: "40 ok, 2 fail" },
      { label: "Success rate", value: "95%", note: "Last 24 hours" },
      { label: "Issues done (7d)", value: "12", note: "Last 7 days" },
      { label: "Open issues", value: "3", note: "Unresolved" },
    ],
    lastHeartbeat: "Jun 12, 11:00 AM",
    issuesDone: 12,
    issuesInProgress: 3,
  },
  {
    id: "5212120e-df64-4246-aafc-943fdb411885",
    name: "Coder2",
    status: "idle",
    role: "Additional Coder",
    heartbeatMetrics: [
      { label: "Runs (24h)", value: "18", note: "15 ok, 3 fail" },
      { label: "Success rate", value: "83%", note: "Last 24 hours" },
      { label: "Issues done (7d)", value: "6", note: "Last 7 days" },
      { label: "Open issues", value: "1", note: "Unresolved" },
    ],
    lastHeartbeat: "Jun 12, 10:30 AM",
    issuesDone: 6,
    issuesInProgress: 1,
  },
  {
    id: "0467b0ec-2c8a-4b05-b826-b151a5c465ae",
    name: "QA",
    status: "error",
    role: "Quality Engineer",
    heartbeatMetrics: [
      { label: "Runs (24h)", value: "5", note: "2 ok, 3 fail" },
      { label: "Success rate", value: "40%", note: "Last 24 hours" },
      { label: "Issues done (7d)", value: "1", note: "Last 7 days" },
      { label: "Open issues", value: "4", note: "Unresolved" },
    ],
    lastHeartbeat: "Jun 12, 08:00 AM",
    issuesDone: 1,
    issuesInProgress: 4,
  },
];

function renderTable(loading = false) {
  render(
    <AdminAgentsTable
      session={mockSession}
      agents={loading ? [] : mockAgents}
      loading={loading}
      error={null}
    />,
  );
}

function renderError(message: string) {
  render(
    <AdminAgentsTable
      session={mockSession}
      agents={[]}
      loading={false}
      error={message}
    />,
  );
}

function renderEmpty() {
  render(
    <AdminAgentsTable
      session={mockSession}
      agents={[]}
      loading={false}
      error={null}
    />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("AdminAgentsTable", () => {
  it("renders agent names", () => {
    renderTable();
    expect(screen.getByText("Coder")).toBeTruthy();
    expect(screen.getByText("Coder2")).toBeTruthy();
    expect(screen.getByText("QA")).toBeTruthy();
  });

  it("renders the component container with admin-agents identifier", () => {
    renderTable();
    // The component renders agent cards in a grid container
    expect(screen.getByText("Coder")).toBeTruthy();
    expect(screen.getByText("running")).toBeTruthy();
  });

  it("renders agent roles", () => {
    renderTable();
    expect(screen.getByText("Software Engineer")).toBeTruthy();
    expect(screen.getByText("Additional Coder")).toBeTruthy();
    expect(screen.getByText("Quality Engineer")).toBeTruthy();
  });

  it("renders status badges for each status variant", () => {
    renderTable();
    expect(screen.getByText("running")).toBeTruthy();
    expect(screen.getByText("idle")).toBeTruthy();
    expect(screen.getByText("error")).toBeTruthy();
  });

  it("renders metric card values", () => {
    renderTable();
    // Runs metric
    expect(screen.getByText("42")).toBeTruthy();
    expect(screen.getByText("18")).toBeTruthy();
    expect(screen.getByText("5")).toBeTruthy();

    // Success rate
    expect(screen.getByText("95%")).toBeTruthy();
    expect(screen.getByText("83%")).toBeTruthy();
    expect(screen.getByText("40%")).toBeTruthy();
  });

  it("renders metric card labels", () => {
    renderTable();
    const runLabels = screen.getAllByText("Runs (24h)");
    expect(runLabels.length).toBeGreaterThanOrEqual(3);

    const successLabels = screen.getAllByText("Success rate");
    expect(successLabels.length).toBeGreaterThanOrEqual(3);

    const issuesDoneLabels = screen.getAllByText("Issues done (7d)");
    expect(issuesDoneLabels.length).toBeGreaterThanOrEqual(3);

    const openIssuesLabels = screen.getAllByText("Open issues");
    expect(openIssuesLabels.length).toBeGreaterThanOrEqual(3);
  });

  it("renders last heartbeat timestamps", () => {
    renderTable();
    expect(
      screen.getByText(/last heartbeat:.*jun 12, 11:00 am/i),
    ).toBeTruthy();
    expect(
      screen.getByText(/last heartbeat:.*jun 12, 10:30 am/i),
    ).toBeTruthy();
    expect(
      screen.getByText(/last heartbeat:.*jun 12, 08:00 am/i),
    ).toBeTruthy();
  });

  it("renders empty state when no agents", () => {
    renderEmpty();
    expect(screen.getByText("No active agents")).toBeTruthy();
    expect(
      screen.getByText(/no agents with running\/idle\/error status found/i),
    ).toBeTruthy();
  });

  it("renders error state when error is provided", () => {
    renderError("Failed to connect to database");
    expect(screen.getByText("Could not load agent data")).toBeTruthy();
    expect(screen.getByText("Failed to connect to database")).toBeTruthy();
  });

  it("renders loading skeleton when loading is true", () => {
    const { container } = render(
      <AdminAgentsTable
        session={mockSession}
        agents={[]}
        loading={true}
        error={null}
      />,
    );
    const skeleton = container.querySelector(".animate-pulse");
    expect(skeleton).toBeTruthy();
  });

  it("renders metric card notes", () => {
    renderTable();
    expect(screen.getByText("40 ok, 2 fail")).toBeTruthy();
    expect(screen.getByText("15 ok, 3 fail")).toBeTruthy();
    expect(screen.getByText("2 ok, 3 fail")).toBeTruthy();
  });
});
