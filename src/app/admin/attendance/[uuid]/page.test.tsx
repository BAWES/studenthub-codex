import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";

// Mock the dependencies
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

const mockAttendance = {
  attendance_uuid: "abc-123",
  employee_uuid: "emp-456",
  date: "2026-06-14",
  clock_in: "2026-06-14T08:00:00.000Z",
  clock_out: "2026-06-14T17:00:00.000Z",
  total_hours: 9,
  status: 10,
  note: "Regular shift",
  created_at: "2026-06-14T06:00:00.000Z",
  updated_at: "2026-06-14T18:00:00.000Z",
};

const mockGetAdminAttendance = vi.fn();

vi.mock("./actions", () => ({
  getAdminAttendance: (...args: unknown[]) => mockGetAdminAttendance(...args),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date) => d.toISOString().split("T")[0],
}));

describe("AdminAttendanceDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders attendance detail with all fields", async () => {
    mockGetAdminAttendance.mockResolvedValue({
      attendance: mockAttendance,
      employee_name: "John Doe",
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ uuid: "abc-123" }),
      }),
    );

    // Check workspace shell
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Attendance");
    expect(screen.getByTestId("title")).toHaveTextContent("Attendance — 2026-06-14");

    // Check metrics
    expect(screen.getByTestId("metric-Employee")).toHaveTextContent("John Doe");
    expect(screen.getByTestId("metric-Status")).toHaveTextContent("Present");
    expect(screen.getByTestId("metric-Total Hours")).toHaveTextContent("9.00h");

    // Check detail fields
    expect(screen.getByTestId("fact-UUID")).toHaveTextContent("abc-123");
    expect(screen.getByTestId("fact-Employee UUID")).toHaveTextContent("emp-456");
    expect(screen.getByTestId("fact-Date")).toHaveTextContent("2026-06-14");
    expect(screen.getByTestId("fact-Clock In")).toHaveTextContent("2026-06-14");
    expect(screen.getByTestId("fact-Clock Out")).toHaveTextContent("2026-06-14");
    expect(screen.getByTestId("fact-Total Hours")).toHaveTextContent("9");
    expect(screen.getByTestId("fact-Status")).toHaveTextContent("Present");
    expect(screen.getByTestId("fact-Note")).toHaveTextContent("Regular shift");

    // Check back button
    expect(screen.getByText("Back to Attendance")).toBeInTheDocument();
  });

  it("renders with null employee uuid and null clock times", async () => {
    mockGetAdminAttendance.mockResolvedValue({
      attendance: { ...mockAttendance, employee_uuid: null, clock_in: null, clock_out: null },
      employee_name: null,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ uuid: "abc-456" }),
      }),
    );

    expect(screen.getByTestId("metric-Employee")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Employee UUID")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Clock In")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Clock Out")).toHaveTextContent("—");
  });

  it("renders with null total hours and null note", async () => {
    mockGetAdminAttendance.mockResolvedValue({
      attendance: { ...mockAttendance, total_hours: null, note: null },
      employee_name: "Jane Doe",
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ uuid: "abc-789" }),
      }),
    );

    expect(screen.getByTestId("metric-Total Hours")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Total Hours")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Note")).toHaveTextContent("—");
  });

  it("renders different status labels", async () => {
    mockGetAdminAttendance.mockResolvedValue({
      attendance: { ...mockAttendance, status: 20 },
      employee_name: "John Late",
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ uuid: "abc-late" }),
      }),
    );

    expect(screen.getByTestId("metric-Status")).toHaveTextContent("Late");
    expect(screen.getByTestId("fact-Status")).toHaveTextContent("Late");
  });

  it("calls notFound when attendance is null", async () => {
    mockGetAdminAttendance.mockResolvedValue({
      attendance: null,
      employee_name: null,
    });

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ uuid: "nonexistent" }) }),
    ).rejects.toThrow();

    expect(notFound).toHaveBeenCalled();
  });

  it("renders unknown status label for unrecognized status values", async () => {
    mockGetAdminAttendance.mockResolvedValue({
      attendance: { ...mockAttendance, status: 99 },
      employee_name: null,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ uuid: "abc-unknown" }),
      }),
    );

    expect(screen.getByTestId("metric-Status")).toHaveTextContent("Unknown (99)");
  });
});
