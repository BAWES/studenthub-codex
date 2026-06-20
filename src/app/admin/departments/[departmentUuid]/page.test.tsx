import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";

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

const mockDepartment = {
  department_uuid: "dept_uuid_abc",
  department_name_en: "Engineering",
  department_name_ar: "الهندسة",
  department_created_at: "2024-01-15T08:00:00.000Z",
  department_updated_at: "2024-06-01T12:00:00.000Z",
};

const mockGetDepartment = vi.fn();

vi.mock("./actions", () => ({
  getDepartment: (...args: unknown[]) => mockGetDepartment(...args),
}));

describe("AdminDepartmentDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders department detail with all fields", async () => {
    mockGetDepartment.mockResolvedValue({ department: mockDepartment, employee_count: 25 });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ departmentUuid: "dept_uuid_abc" }),
      }),
    );

    // Check workspace shell
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Departments");
    expect(screen.getByTestId("title")).toHaveTextContent("Engineering");

    // Check metrics
    expect(screen.getByTestId("metric-Employees")).toHaveTextContent("25");

    // Check detail fields
    expect(screen.getByTestId("fact-Name (EN)")).toHaveTextContent("Engineering");
    expect(screen.getByTestId("fact-Name (AR)")).toHaveTextContent("الهندسة");
    expect(screen.getByTestId("fact-Employees")).toHaveTextContent("25");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("2024-01-15");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("2024-06-01");
  });

  it("renders null Arabic name as em-dash", async () => {
    mockGetDepartment.mockResolvedValue({
      department: { ...mockDepartment, department_name_ar: null, department_created_at: null, department_updated_at: null },
      employee_count: 0,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ departmentUuid: "dept_ar_null" }),
      }),
    );

    expect(screen.getByTestId("fact-Name (AR)")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("—");
  });

  it("calls notFound when department is null", async () => {
    mockGetDepartment.mockResolvedValue({ department: null, employee_count: 0 });

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ departmentUuid: "nonexistent" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
