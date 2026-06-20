import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

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

const mockTicket = {
  ticket_id: 42,
  ticket_uuid: "tkt_uuid_abc123",
  ticket_detail: "Login issue on mobile app",
  ticket_status: 0,
  ticket_started_at: "2024-03-01T10:00:00.000Z",
  ticket_completed_at: null,
  response_time: 2.5,
  resolution_time: null,
  candidate_name: "Ahmed Khan",
  staff_name: "Staff User",
  created_at: "2024-03-01T09:00:00.000Z",
  updated_at: "2024-03-05T14:00:00.000Z",
};

const mockGetTicket = vi.fn();

vi.mock("./actions", () => ({
  getTicket: (...args: unknown[]) => mockGetTicket(...args),
}));

describe("AdminTicketDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders open ticket detail with all fields", async () => {
    mockGetTicket.mockResolvedValue({ ticket: mockTicket });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ ticketUuid: "tkt_uuid_abc123" }),
      }),
    );

    // Check workspace shell
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Tickets");
    expect(screen.getByTestId("title")).toHaveTextContent("Login issue on mobile app");

    // Check metrics
    expect(screen.getByTestId("metric-Status")).toHaveTextContent("Open");
    expect(screen.getByTestId("metric-Response Time")).toHaveTextContent("2.5h");
    expect(screen.getByTestId("metric-Resolution Time")).toHaveTextContent("—");

    // Check detail fields
    expect(screen.getByTestId("fact-Detail")).toHaveTextContent("Login issue on mobile app");
    expect(screen.getByTestId("fact-Status")).toHaveTextContent("Open");
    expect(screen.getByTestId("fact-Candidate")).toHaveTextContent("Ahmed Khan");
    expect(screen.getByTestId("fact-Staff")).toHaveTextContent("Staff User");
    expect(screen.getByTestId("fact-Started")).toHaveTextContent("2024-03-01");
    expect(screen.getByTestId("fact-Completed")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Response Time")).toHaveTextContent("2.5 hours");
    expect(screen.getByTestId("fact-Resolution Time")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("2024-03-01");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("2024-03-05");

    // Check back button
    expect(screen.getByText("Back to Tickets")).toBeInTheDocument();
  });

  it("displays In Progress status when ticket_status is 1", async () => {
    mockGetTicket.mockResolvedValue({
      ticket: { ...mockTicket, ticket_status: 1 },
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ ticketUuid: "tkt_in_progress" }),
      }),
    );

    expect(screen.getByTestId("metric-Status")).toHaveTextContent("In Progress");
    expect(screen.getByTestId("fact-Status")).toHaveTextContent("In Progress");
  });

  it("renders null fields as em-dash", async () => {
    mockGetTicket.mockResolvedValue({
      ticket: {
        ...mockTicket,
        ticket_detail: null,
        ticket_started_at: null,
        response_time: null,
        candidate_name: null,
        staff_name: null,
        created_at: null,
        updated_at: null,
      },
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ ticketUuid: "tkt_null" }),
      }),
    );

    expect(screen.getByTestId("title")).toHaveTextContent("Ticket Detail");
    expect(screen.getByTestId("fact-Detail")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Started")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Response Time")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Candidate")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Staff")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("—");
    expect(screen.getByTestId("metric-Response Time")).toHaveTextContent("—");
    expect(screen.getByTestId("metric-Resolution Time")).toHaveTextContent("—");
  });

  it("calls notFound when ticket is null", async () => {
    mockGetTicket.mockResolvedValue({ ticket: null });

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ ticketUuid: "nonexistent" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
