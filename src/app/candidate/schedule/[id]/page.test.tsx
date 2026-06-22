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

const mockGetScheduleDetail = vi.fn();

vi.mock("../actions", () => ({
  getScheduleDetail: (...args: unknown[]) => mockGetScheduleDetail(...args),
}));

const mockNotFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("next/navigation", () => ({
  notFound: mockNotFound,
}));

const mockScheduleData = {
  cwd_uuid: "sched-abc-123",
  date: new Date("2025-03-15"),
  start_time: new Date("2025-03-15T09:00:00Z"),
  end_time: new Date("2025-03-15T17:00:00Z"),
  total_time: 480,
  status: 1,
  created_at: new Date("2025-03-10"),
  updated_at: new Date("2025-03-12"),
  store: {
    store_name: "Al-Mubarakiya Branch",
    company: { company_name: "Tech Corp Kuwait" },
  },
};

describe("CandidateScheduleDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders schedule detail with WorkspaceShell and correct eyebrow", async () => {
    mockGetScheduleDetail.mockResolvedValue(mockScheduleData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "sched-abc-123" }) }));

    expect(screen.getByTestId("workspace-shell")).toBeDefined();
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Candidate / Schedule");
    expect(screen.getByTestId("title")).toHaveTextContent("Al-Mubarakiya Branch · 2025-03-15");
  });

  it("renders Working Date Details section with all facts", async () => {
    mockGetScheduleDetail.mockResolvedValue(mockScheduleData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "sched-abc-123" }) }));

    expect(screen.getByTestId("section-title")).toHaveTextContent("Working Date Details");
    expect(screen.getByTestId("fact-Company")).toHaveTextContent("Tech Corp Kuwait");
    expect(screen.getByTestId("fact-Store")).toHaveTextContent("Al-Mubarakiya Branch");
    expect(screen.getByTestId("fact-Date")).toHaveTextContent("2025-03-15");
    expect(screen.getByTestId("fact-Start Time")).toHaveTextContent("2025-03-15");
    expect(screen.getByTestId("fact-End Time")).toHaveTextContent("2025-03-15");
    expect(screen.getByTestId("fact-Total Time")).toHaveTextContent("480 min");
    expect(screen.getByTestId("fact-Status")).toHaveTextContent("Confirmed");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("2025-03-10");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("2025-03-12");
  });

  it("shows correct status labels for different status values", async () => {
    const statusLabels: Record<number, string> = {
      0: "Pending",
      1: "Confirmed",
      2: "Cancelled",
      3: "Completed",
    };

    for (const [status, label] of Object.entries(statusLabels)) {
      vi.clearAllMocks();
      cleanup();

      mockGetScheduleDetail.mockResolvedValue({
        ...mockScheduleData,
        status: Number(status),
      });

      const Page = (await import("./page")).default;
      render(await Page({ params: Promise.resolve({ id: `sched-${status}` }) }));

      expect(screen.getByTestId("fact-Status")).toHaveTextContent(label);
    }
  });

  it("shows 'Unknown' for null status", async () => {
    mockGetScheduleDetail.mockResolvedValue({
      ...mockScheduleData,
      status: null,
    });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "sched-null-status" }) }));

    expect(screen.getByTestId("fact-Status")).toHaveTextContent("Unknown");
  });

  it("shows 'Status N' for unrecognized status numbers", async () => {
    mockGetScheduleDetail.mockResolvedValue({
      ...mockScheduleData,
      status: 99,
    });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "sched-99" }) }));

    expect(screen.getByTestId("fact-Status")).toHaveTextContent("Status 99");
  });

  it("shows '—' for total_time when null", async () => {
    mockGetScheduleDetail.mockResolvedValue({
      ...mockScheduleData,
      total_time: null,
    });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "sched-no-time" }) }));

    expect(screen.getByTestId("fact-Total Time")).toHaveTextContent("—");
  });

  it("shows fallback title when store is null", async () => {
    mockGetScheduleDetail.mockResolvedValue({
      ...mockScheduleData,
      store: null,
    });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "sched-no-store" }) }));

    expect(screen.getByTestId("title")).toHaveTextContent("Working date · 2025-03-15");
  });

  it("handles missing company in store", async () => {
    mockGetScheduleDetail.mockResolvedValue({
      ...mockScheduleData,
      store: { store_name: "Al-Mubarakiya Branch", company: null },
    });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "sched-no-company" }) }));

    // In the mock, String(undefined) renders as "undefined"
    expect(screen.getByTestId("fact-Company")).toHaveTextContent("undefined");
  });

  it("calls notFound when getScheduleDetail returns null", async () => {
    mockGetScheduleDetail.mockResolvedValue(null);

    const Page = (await import("./page")).default;
    await expect(Page({ params: Promise.resolve({ id: "nonexistent" }) })).rejects.toThrow(
      "NEXT_NOT_FOUND"
    );
    expect(mockNotFound).toHaveBeenCalledOnce();
  });
});
