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
          {String(m.value)}
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
      {facts?.map((f) => (
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

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date) => d.toISOString().split("T")[0],
}));

const mockGetReport = vi.fn();

vi.mock("./actions", () => ({
  getReport: (...args: unknown[]) => mockGetReport(...args),
}));

describe("AdminReportDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  /**
   * Full rendering tests for RecruiterDailySection and InvitationSummarySection
   * cannot run in vitest because they are inline async sub-components which React
   * treats as async Client Components. Only the error-path tests (notFound) are
   * verified here. The sub-section rendering is covered by the data contract
   * at the module level (see src/modules/admin/reports/actions.ts).
   */

  it("calls notFound when report type is missing from searchParams", async () => {
    const Page = (await import("./page")).default;

    await expect(
      Page({
        params: Promise.resolve({ id: "report-003" }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("calls notFound when report is null", async () => {
    mockGetReport.mockResolvedValue(null);

    const Page = (await import("./page")).default;

    await expect(
      Page({
        params: Promise.resolve({ id: "nonexistent" }),
        searchParams: Promise.resolve({ type: "recruiter-daily" }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("calls notFound when type is unknown (not in searchParams)", async () => {
    // getReport will still be called but with empty type — page checks type first
    const Page = (await import("./page")).default;

    await expect(
      Page({
        params: Promise.resolve({ id: "report-004" }),
        searchParams: Promise.resolve({ type: "" }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
