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

const mockGetStaffLeave = vi.fn();

vi.mock("@/modules/staff-leaves/actions", () => ({
  getStaffLeave: (uuid: string) => mockGetStaffLeave(uuid),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockFullLeave = {
  staff_leave_uuid: "sl_abc123",
  staff_id: 42,
  staff_name: "John Doe",
  from_date: "2026-06-01T00:00:00.000Z",
  to_date: "2026-06-05T00:00:00.000Z",
  note: "Annual leave",
  category: "annual",
  status: 0,
  created_at: "2026-05-20T10:00:00.000Z",
  updated_at: "2026-05-20T10:00:00.000Z",
};

describe("StaffLeaveDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders leave detail with all fields", async () => {
    mockGetStaffLeave.mockResolvedValue(mockFullLeave);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ leaveUuid: "sl_abc123" }),
      }),
    );

    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Staff / Leaves");
    expect(screen.getByTestId("title")).toHaveTextContent("John Doe");

    expect(screen.getByTestId("fact-Staff")).toHaveTextContent("John Doe");
    expect(screen.getByTestId("fact-Category")).toHaveTextContent("Annual");
    expect(screen.getByTestId("fact-Status")).toHaveTextContent("Pending");
    expect(screen.getByTestId("fact-Note")).toHaveTextContent("Annual leave");

    expect(screen.getByText("Back to Leaves")).toBeInTheDocument();
  });

  it("renders with all nullable fields as null", async () => {
    mockGetStaffLeave.mockResolvedValue({
      staff_leave_uuid: "sl_def456",
      staff_id: null,
      staff_name: null,
      from_date: null,
      to_date: null,
      note: null,
      category: null,
      status: null,
      created_at: null,
      updated_at: null,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ leaveUuid: "sl_def456" }),
      }),
    );

    expect(screen.getByTestId("title")).toHaveTextContent("Leave Detail");
    expect(screen.getByTestId("fact-Staff")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Category")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Status")).toHaveTextContent("Unknown");
    expect(screen.getByTestId("fact-Note")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-From")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-To")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("—");

    expect(screen.getByText("Back to Leaves")).toBeInTheDocument();
  });

  it("renders approved status", async () => {
    mockGetStaffLeave.mockResolvedValue({
      ...mockFullLeave,
      status: 1,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ leaveUuid: "sl-approved" }),
      }),
    );

    expect(screen.getByTestId("fact-Status")).toHaveTextContent("Approved");
  });

  it("renders rejected status", async () => {
    mockGetStaffLeave.mockResolvedValue({
      ...mockFullLeave,
      status: 2,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ leaveUuid: "sl-rejected" }),
      }),
    );

    expect(screen.getByTestId("fact-Status")).toHaveTextContent("Rejected");
  });

  it("renders cancelled status", async () => {
    mockGetStaffLeave.mockResolvedValue({
      ...mockFullLeave,
      status: 3,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ leaveUuid: "sl-cancelled" }),
      }),
    );

    expect(screen.getByTestId("fact-Status")).toHaveTextContent("Cancelled");
  });

  it("renders unknown status for unrecognized values", async () => {
    mockGetStaffLeave.mockResolvedValue({
      ...mockFullLeave,
      status: 99,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ leaveUuid: "sl-unknown" }),
      }),
    );

    expect(screen.getByTestId("fact-Status")).toHaveTextContent("Unknown (99)");
  });

  it("calls notFound when leave is null", async () => {
    mockGetStaffLeave.mockResolvedValue(null);

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ leaveUuid: "nonexistent" }) }),
    ).rejects.toThrow();

    expect(notFound).toHaveBeenCalled();
  });
});
