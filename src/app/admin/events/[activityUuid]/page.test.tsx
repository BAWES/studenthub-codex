// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({
    user: { id: "1" },
    role: "admin",
  }),
}));

vi.mock("@/modules/workspace/ErrorBoundary", () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date | null | undefined) => {
    if (!d) return "Not set";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
  },
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

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

// ── Shared mock ──────────────────────────────────────────────────────────────

const mockGetEvent = vi.fn();
vi.mock("../actions", () => ({
  getEvent: (...args: Parameters<typeof mockGetEvent>) => mockGetEvent(...args),
}));

// ── Test data ────────────────────────────────────────────────────────────────

const mockEvent = {
  activity_uuid: "evt-abc-123",
  request_uuid: "req-def-456",
  activity_detail: "Candidate uploaded CV document",
  staff_name: "Ahmad Al-Sabah",
  activity_created_datetime: new Date("2026-06-20T10:30:00Z"),
  activity_updated_datetime: new Date("2026-06-20T10:30:00Z"),
};

// ── Tests ────────────────────────────────────────────────────────────────────

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
        params: Promise.resolve({ activityUuid: "evt-abc-123" }),
      }),
    );

    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Events");
    expect(screen.getByTestId("title")).toHaveTextContent("Activity event evt-abc-123");

    expect(screen.getByTestId("fact-Activity UUID")).toHaveTextContent("evt-abc-123");
    expect(screen.getByTestId("fact-Request UUID")).toHaveTextContent("req-def-456");
    expect(screen.getByTestId("fact-Detail")).toHaveTextContent("Candidate uploaded CV document");
    expect(screen.getByTestId("fact-Staff")).toHaveTextContent("Ahmad Al-Sabah");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("Jun 20, 2026");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("Jun 20, 2026");
  });

  it("renders null fields as em-dash", async () => {
    mockGetEvent.mockResolvedValue({
      activity_uuid: "evt-null-999",
      request_uuid: "req-null-999",
      activity_detail: null,
      staff_name: null,
      activity_created_datetime: null,
      activity_updated_datetime: null,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ activityUuid: "evt-null-999" }),
      }),
    );

    expect(screen.getByTestId("fact-Activity UUID")).toHaveTextContent("evt-null-999");
    expect(screen.getByTestId("fact-Detail")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Staff")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("—");
  });

  it("calls notFound when event is null", async () => {
    mockGetEvent.mockResolvedValue(null);

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ activityUuid: "nonexistent" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
