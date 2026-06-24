import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

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

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date) => d.toISOString().split("T")[0],
}));

const mockSalaryScale = {
  salary_scale_id: 42,
  salary_scale_name_en: "Grade A",
  salary_scale_name_ar: "الدرجة أ",
  salary_scale_min_amount: 500.0,
  salary_scale_max_amount: 1500.0,
  candidate_count: 12,
};

const mockGetSalaryScale = vi.fn();

vi.mock("@/app/admin/salary-scales/actions", () => ({
  getSalaryScale: (...args: unknown[]) => mockGetSalaryScale(...args),
}));

describe("AdminSalaryScaleDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders salary scale detail with all fields", async () => {
    mockGetSalaryScale.mockResolvedValue(mockSalaryScale);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "42" }),
      }),
    );

    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Salary scales");
    expect(screen.getByTestId("title")).toHaveTextContent("Grade A");

    expect(screen.getByTestId("metric-Sort order")).toHaveTextContent("42");
    expect(screen.getByTestId("metric-Candidates")).toHaveTextContent("12");

    expect(screen.getByTestId("fact-ID")).toHaveTextContent("42");
    expect(screen.getByTestId("fact-Name (English)")).toHaveTextContent("Grade A");
    expect(screen.getByTestId("fact-Name (Arabic)")).toHaveTextContent("الدرجة أ");
    expect(screen.getByTestId("fact-Min amount")).toHaveTextContent("500");
    expect(screen.getByTestId("fact-Max amount")).toHaveTextContent("1500");
  });

  it("renders null fields as em-dash", async () => {
    mockGetSalaryScale.mockResolvedValue({
      ...mockSalaryScale,
      salary_scale_name_ar: null,
      salary_scale_min_amount: null,
      salary_scale_max_amount: null,
      candidate_count: null,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "42" }),
      }),
    );

    expect(screen.getByTestId("metric-Sort order")).toHaveTextContent("42");
    expect(screen.getByTestId("metric-Candidates")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Name (Arabic)")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Min amount")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Max amount")).toHaveTextContent("—");
  });

  it("calls notFound when salary scale is null", async () => {
    mockGetSalaryScale.mockResolvedValue(null);

    const Page = (await import("./page")).default;
    await expect(
      Page({ params: Promise.resolve({ id: "42" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("parses id as integer for getSalaryScale", async () => {
    mockGetSalaryScale.mockResolvedValue(mockSalaryScale);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "42" }),
      }),
    );

    expect(mockGetSalaryScale).toHaveBeenCalledWith(42);
  });
});
