import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { AdminDashboardClient } from "../_components";
import type { DashboardData } from "../schemas";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
  usePathname: () => "/admin/dashboard",
}));

const mockSession = {
  user_uuid: "u-001",
  role: "admin",
  email: "admin@test.com",
  name: "Admin",
} as any;

const baseDashboard: DashboardData = {
  metrics: [
    { label: "Candidates", value: 53000, note: "124 need review" },
    { label: "Companies", value: 524, note: "320 approved to hire" },
    { label: "Requests", value: 1250, note: "Hiring demand pipeline" },
    { label: "Transfers", value: 890, note: "Payroll and invoice runs" },
  ],
  statusMix: [
    { label: "Active", value: 450 },
    { label: "Pending", value: 120 },
    { label: "Completed", value: 680 },
  ],
  recentCandidates: [
    {
      id: 1,
      title: "Alice Smith",
      subtitle: "alice@example.com",
      meta: "Active",
      amount: "15 KWD",
      date: "Jun 12",
    },
  ],
  recentCompanies: [
    {
      id: 1,
      title: "Acme Corp",
      subtitle: "hr@acme.com",
      meta: "Approved",
      amount: "20 KWD",
      date: "Jun 11",
      count: 3,
    },
  ],
  recentRequests: [
    {
      id: "r-1",
      title: "Software Engineer",
      subtitle: "Acme Corp",
      meta: "Pending",
      count: 2,
      date: "Jun 10",
    },
  ],
  recentTransfers: [
    {
      id: 1,
      title: "Acme Corp",
      subtitle: "Jun 1 to Jun 30",
      meta: "Status 1",
      amount: "5000 KWD",
    },
  ],
  prMergeMetrics: [
    { label: "Avg time-to-merge", value: "2.5h", note: "Across 12 PRs" },
    { label: "Median time-to-merge", value: "1.8h", note: "Midpoint" },
  ],
  recentPrMergeTimes: [
    { number: 1042, title: "Fix login bug", hours: 1.5 },
    { number: 1041, title: "Add dark mode", hours: 3.2 },
  ],
};

afterEach(() => {
  cleanup();
});

describe("AdminDashboardClient", () => {
  it("renders the WorkspaceShell with eyebrow and title", () => {
    render(
      <AdminDashboardClient session={mockSession} dashboard={baseDashboard} />,
    );
    expect(screen.getByText("Admin Workspace")).toBeTruthy();
    expect(
      screen.getByText(/command center for the whole operation/i),
    ).toBeTruthy();
  });

  it("renders metric cards with values", () => {
    render(
      <AdminDashboardClient session={mockSession} dashboard={baseDashboard} />,
    );
    expect(screen.getByText("53,000")).toBeTruthy();
    expect(screen.getByText("524")).toBeTruthy();
    expect(screen.getByText("1,250")).toBeTruthy();
    expect(screen.getByText("890")).toBeTruthy();
  });

  it("renders request pipeline status items", () => {
    render(
      <AdminDashboardClient session={mockSession} dashboard={baseDashboard} />,
    );
    expect(screen.getByText("Request Pipeline")).toBeTruthy();
    expect(screen.getByText("450")).toBeTruthy();
    expect(screen.getByText("120")).toBeTruthy();
    expect(screen.getByText("680")).toBeTruthy();
  });

  it("renders PR merge metrics", () => {
    render(
      <AdminDashboardClient session={mockSession} dashboard={baseDashboard} />,
    );
    expect(screen.getByText("Avg time-to-merge")).toBeTruthy();
    expect(screen.getByText("Median time-to-merge")).toBeTruthy();
  });

  it("renders recent PR merges", () => {
    render(
      <AdminDashboardClient session={mockSession} dashboard={baseDashboard} />,
    );
    expect(screen.getByText("#1042")).toBeTruthy();
    expect(screen.getByText("#1041")).toBeTruthy();
  });

  it("renders all four recent activity sections", () => {
    render(
      <AdminDashboardClient session={mockSession} dashboard={baseDashboard} />,
    );
    // Use getAllByText and assert length to handle sidebar + content matches
    expect(screen.getAllByText("Candidates").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Companies").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Requests").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Transfers").length).toBeGreaterThanOrEqual(1);
  });

  it("renders item details inside recent lists", () => {
    render(
      <AdminDashboardClient session={mockSession} dashboard={baseDashboard} />,
    );
    expect(screen.getByText("Alice Smith")).toBeTruthy();
    // "Acme Corp" appears in both Companies and Transfers sections, use getAllByText
    expect(screen.getAllByText("Acme Corp").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Software Engineer")).toBeTruthy();
  });

  it("renders empty state when statusMix is empty", () => {
    const emptyDash: DashboardData = {
      ...baseDashboard,
      statusMix: [],
    };
    render(
      <AdminDashboardClient session={mockSession} dashboard={emptyDash} />,
    );
    expect(screen.getByText("No requests in pipeline")).toBeTruthy();
  });

  it("renders empty state when prMergeMetrics is empty", () => {
    const emptyDash: DashboardData = {
      ...baseDashboard,
      prMergeMetrics: [],
      recentPrMergeTimes: [],
    };
    render(
      <AdminDashboardClient session={mockSession} dashboard={emptyDash} />,
    );
    expect(screen.getByText("No PR merge data available")).toBeTruthy();
  });

  it("renders empty state when recent lists are empty", () => {
    const emptyDash: DashboardData = {
      ...baseDashboard,
      recentCandidates: [],
      recentCompanies: [],
      recentRequests: [],
      recentTransfers: [],
    };
    render(
      <AdminDashboardClient session={mockSession} dashboard={emptyDash} />,
    );
    expect(screen.getByText("No recent candidates")).toBeTruthy();
    expect(screen.getByText("No recent companies")).toBeTruthy();
    expect(screen.getByText("No recent requests")).toBeTruthy();
    expect(screen.getByText("No recent transfers")).toBeTruthy();
  });

  it("renders company seat count when present", () => {
    render(
      <AdminDashboardClient session={mockSession} dashboard={baseDashboard} />,
    );
    expect(screen.getByText("3 seats")).toBeTruthy();
  });

  it("renders request count when present", () => {
    render(
      <AdminDashboardClient session={mockSession} dashboard={baseDashboard} />,
    );
    expect(screen.getByText("2 seats")).toBeTruthy();
  });
});
