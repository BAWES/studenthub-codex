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

const mockEvent = {
  activity_uuid: "act_abc123",
  request_uuid: "req_def456",
  activity_detail: "Candidate profile updated by admin",
  staff_name: "Admin User",
  activity_created_datetime: new Date("2024-03-01T10:00:00.000Z"),
  activity_updated_datetime: new Date("2024-03-01T12:30:00.000Z"),
};

const mockGetEvent = vi.fn();

vi.mock("./actions", () => ({
  getEvent: (...args: unknown[]) => mockGetEvent(...args),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date) => d.toISOString().split("T")[0],
}));

describe("AdminEventDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders event detail with all fields", async () => {
    mockGetEvent.mockResolvedValue(mockEvent);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "act_abc123" }),
      }),
    );

    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Events");
    expect(screen.getByTestId("title")).toHaveTextContent("Activity Event — Candidate profile updated by admin");

    expect(screen.getByTestId("metric-Activity UUID")).toHaveTextContent("act_abc123");
    expect(screen.getByTestId("metric-Staff")).toHaveTextContent("Admin User");
    expect(screen.getByTestId("metric-Created")).toHaveTextContent("2024-03-01");

    expect(screen.getByTestId("fact-Activity UUID")).toHaveTextContent("act_abc123");
    expect(screen.getByTestId("fact-Request UUID")).toHaveTextContent("req_def456");
    expect(screen.getByTestId("fact-Detail")).toHaveTextContent("Candidate profile updated by admin");
    expect(screen.getByTestId("fact-Staff Name")).toHaveTextContent("Admin User");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("2024-03-01");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("2024-03-01");

    expect(screen.getByText("Back to Events")).toBeInTheDocument();
  });

  it("renders with nullable fields as dash", async () => {
    mockGetEvent.mockResolvedValue({
      ...mockEvent,
      staff_name: null,
      activity_created_datetime: null,
      activity_updated_datetime: null,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "act_null_test" }),
      }),
    );

    expect(screen.getByTestId("metric-Staff")).toHaveTextContent("—");
    expect(screen.getByTestId("metric-Created")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Staff Name")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("—");
  });

  it("calls notFound when event is null", async () => {
    mockGetEvent.mockResolvedValue(null);

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "nonexistent" }) }),
    ).rejects.toThrow();

    expect(notFound).toHaveBeenCalled();
  });
});
