import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { AdminDashboardContent } from "../_components";

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

const mockData = {
  metrics: [
    { label: "Candidates", value: 53420, note: "1,234 need review" },
    { label: "Companies", value: 524, note: "312 approved to hire" },
    { label: "Requests", value: 1823, note: "Hiring demand pipeline" },
    { label: "Transfers", value: 4630, note: "Payroll and invoice runs" },
  ],
  statusMix: [
    { label: "Pending", value: 45 },
    { label: "Approved", value: 120 },
    { label: "In Progress", value: 67 },
    { label: "Completed", value: 89 },
  ],
  recentCandidates: [
    { id: 1, title: "Ahmed Al-Sabah", subtitle: "ahmed@example.com", meta: "Needs review", date: "Jun 1, 2026" },
    { id: 2, title: "Noor Ali", subtitle: "noor@example.com", meta: "Active", date: "Jun 1, 2026" },
  ],
  recentCompanies: [
    { id: 1, title: "Gulf Tech", subtitle: "info@gulftech.com", meta: "Approved", date: "Jun 1, 2026" },
    { id: 2, title: "Kuwait Ventures", subtitle: "info@kv.com", meta: "Not approved", date: "May 30, 2026" },
  ],
  recentRequests: [
    { id: "req-1", title: "Software Engineer", subtitle: "Gulf Tech", meta: "Open", date: "Jun 2, 2026" },
    { id: "req-2", title: "Data Analyst", subtitle: "Kuwait Ventures", meta: "In Progress", date: "Jun 1, 2026" },
  ],
  recentTransfers: [
    { id: 1001, title: "Gulf Tech", subtitle: "Jun 1 to Jun 30", meta: "Status 1", amount: "1,500.000 KWD", date: "" },
    { id: 1002, title: "Kuwait Ventures", subtitle: "May 1 to May 31", meta: "Status 2", amount: "2,300.000 KWD", date: "" },
  ],
  prMergeMetrics: [
    { label: "Avg time-to-merge", value: "4.2h", note: "Across 12 PRs" },
    { label: "Median time-to-merge", value: "3.1h", note: "Midpoint of last 50" },
    { label: "Merged (7d)", value: "12", note: "PRs in last batch" },
  ],
  recentPrMergeTimes: [
    { number: 1106, title: "feat: admin tickets", hours: 2.5 },
    { number: 1105, title: "feat: admin invoices", hours: 5.1 },
  ],
};

function renderDashboard() {
  render(<AdminDashboardContent session={mockSession} data={mockData} />);
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("AdminDashboardContent", () => {
  it("renders the page heading", () => {
    renderDashboard();
    expect(
      screen.getByRole("heading", {
        name: /platform overview/i,
      }),
    ).toBeTruthy();
  });

  it("renders metric cards with correct values", () => {
    renderDashboard();
    expect(screen.getByText("53,420")).toBeTruthy();
    expect(screen.getByText("524")).toBeTruthy();
    expect(screen.getByText("1,823")).toBeTruthy();
    expect(screen.getByText("4,630")).toBeTruthy();
  });

  it("renders metric labels", () => {
    renderDashboard();
    const candidateLabels = screen.getAllByText("Candidates");
    expect(candidateLabels.length).toBeGreaterThanOrEqual(1);
    const companyLabels = screen.getAllByText("Companies");
    expect(companyLabels.length).toBeGreaterThanOrEqual(1);
    const requestLabels = screen.getAllByText("Requests");
    expect(requestLabels.length).toBeGreaterThanOrEqual(1);
    const transferLabels = screen.getAllByText("Transfers");
    expect(transferLabels.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the request pipeline section", () => {
    renderDashboard();
    expect(screen.getByText("Request Pipeline")).toBeTruthy();
    const pendingItems = screen.getAllByText("Pending");
    expect(pendingItems.length).toBeGreaterThanOrEqual(1);
    const approvedItems = screen.getAllByText("Approved");
    expect(approvedItems.length).toBeGreaterThanOrEqual(1);
    const inProgressItems = screen.getAllByText("In Progress");
    expect(inProgressItems.length).toBeGreaterThanOrEqual(1);
    const completedItems = screen.getAllByText("Completed");
    expect(completedItems.length).toBeGreaterThanOrEqual(1);
  });

  it("renders PR merge metrics", () => {
    renderDashboard();
    expect(screen.getByText("PR Time-to-Merge")).toBeTruthy();
    expect(screen.getByText("4.2h")).toBeTruthy();
    expect(screen.getByText("12")).toBeTruthy();
  });

  it("renders recent activity tables", () => {
    renderDashboard();
    const candidateHeaders = screen.getAllByText("Recent Candidates");
    expect(candidateHeaders.length).toBeGreaterThanOrEqual(1);
    const companyHeaders = screen.getAllByText("Recent Companies");
    expect(companyHeaders.length).toBeGreaterThanOrEqual(1);
    const requestHeaders = screen.getAllByText("Recent Requests");
    expect(requestHeaders.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Recent Transfers")).toBeTruthy();
  });
});
