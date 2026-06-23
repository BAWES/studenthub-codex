import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";

// Mock dependencies
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({
    user: { id: "1" },
    role: "admin",
    capabilities: ["admin.read", "admin.write"],
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

const mockGetEmployeeById = vi.fn();

vi.mock("./actions", () => ({
  getEmployeeById: (...args: unknown[]) => mockGetEmployeeById(...args),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date) => d.toISOString().split("T")[0],
}));

const validEmployee = {
  employee_uuid: "emp-001",
  employee_name: "John Doe",
  employee_email: "john@example.com",
  employee_phone: "+965 5555 1234",
  employee_salary: 2500.5,
  employee_status: 10,
  employee_role: "staff",
  employee_created_at: new Date("2026-01-15"),
  employee_updated_at: new Date("2026-06-01"),
  designation_uuid: "des-001",
  department_uuid: "dep-001",
  designation_name_en: "Software Engineer",
  department_name_en: "Engineering",
};

describe("AdminEmployeeDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders employee detail with all fields", async () => {
    mockGetEmployeeById.mockResolvedValue(validEmployee);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "emp-001" }),
      }),
    );

    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Employees");
    expect(screen.getByTestId("title")).toHaveTextContent("John Doe");
    expect(screen.getByTestId("metric-Status")).toHaveTextContent("Active");
    expect(screen.getByTestId("metric-Role")).toHaveTextContent("Staff");
    expect(screen.getByTestId("metric-Designation")).toHaveTextContent("Software Engineer");
    expect(screen.getByTestId("metric-Department")).toHaveTextContent("Engineering");
    expect(screen.getByTestId("fact-UUID")).toHaveTextContent("emp-001");
    expect(screen.getByTestId("fact-Name")).toHaveTextContent("John Doe");
    expect(screen.getByTestId("fact-Email")).toHaveTextContent("john@example.com");
    expect(screen.getByTestId("fact-Phone")).toHaveTextContent("+965 5555 1234");
    expect(screen.getByTestId("fact-Salary")).toHaveTextContent("2500.500 KWD");
    expect(screen.getByTestId("fact-Status")).toHaveTextContent("Active");
    expect(screen.getByTestId("fact-Role")).toBeInTheDocument();
    expect(screen.getByTestId("fact-Designation")).toHaveTextContent("Software Engineer");
    expect(screen.getByTestId("fact-Department")).toHaveTextContent("Engineering");
    expect(screen.getByText("Back to Employees")).toBeInTheDocument();
  });

  it("shows Promote to Admin button for staff employee", async () => {
    mockGetEmployeeById.mockResolvedValue(validEmployee);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "emp-001" }),
      }),
    );

    expect(screen.getByText("Promote to Admin")).toBeInTheDocument();
    expect(screen.queryByText("Demote to Staff")).not.toBeInTheDocument();
  });

  it("shows Demote to Staff button for admin employee", async () => {
    mockGetEmployeeById.mockResolvedValue({
      ...validEmployee,
      employee_role: "admin",
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "emp-admin" }),
      }),
    );

    expect(screen.getByText("Demote to Staff")).toBeInTheDocument();
    expect(screen.queryByText("Promote to Admin")).not.toBeInTheDocument();
  });

  it("shows Promote to Admin for employee with null role", async () => {
    mockGetEmployeeById.mockResolvedValue({
      ...validEmployee,
      employee_role: null,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "emp-norole" }),
      }),
    );

    expect(screen.getByText("Promote to Admin")).toBeInTheDocument();
    expect(screen.getByTestId("metric-Role")).toHaveTextContent("—");
  });

  it("does not show role change button when user lacks admin.write", async () => {
    const { requireRoleCapability } = await import("@/modules/auth/session");
    vi.mocked(requireRoleCapability).mockResolvedValueOnce({
      role: "admin",
      id: "1",
      name: "Admin",
      email: "admin@test.com",
      issuedAt: Date.now(),
      capabilities: ["admin.read"],
    });

    mockGetEmployeeById.mockResolvedValue(validEmployee);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "emp-001" }),
      }),
    );

    expect(screen.queryByText("Promote to Admin")).not.toBeInTheDocument();
    expect(screen.queryByText("Demote to Staff")).not.toBeInTheDocument();
  });

  it("renders with null phone and null salary", async () => {
    mockGetEmployeeById.mockResolvedValue({
      ...validEmployee,
      employee_phone: null,
      employee_salary: null,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "emp-002" }),
      }),
    );

    expect(screen.getByTestId("fact-Phone")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Salary")).toHaveTextContent("—");
  });

  it("renders with null designation and department names", async () => {
    mockGetEmployeeById.mockResolvedValue({
      ...validEmployee,
      designation_name_en: null,
      department_name_en: null,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "emp-003" }),
      }),
    );

    expect(screen.getByTestId("metric-Designation")).toHaveTextContent("—");
    expect(screen.getByTestId("metric-Department")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Designation")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Department")).toHaveTextContent("—");
  });

  it("renders different status labels", async () => {
    mockGetEmployeeById.mockResolvedValue({
      ...validEmployee,
      employee_status: 20,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "emp-suspended" }),
      }),
    );

    expect(screen.getByTestId("metric-Status")).toHaveTextContent("Suspended");
    expect(screen.getByTestId("fact-Status")).toHaveTextContent("Suspended");
  });

  it("renders unknown status for unrecognized values", async () => {
    mockGetEmployeeById.mockResolvedValue({
      ...validEmployee,
      employee_status: 99,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "emp-unknown" }),
      }),
    );

    expect(screen.getByTestId("metric-Status")).toHaveTextContent("Unknown (99)");
  });

  it("calls notFound when employee is null", async () => {
    mockGetEmployeeById.mockResolvedValue(null);

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "nonexistent" }) }),
    ).rejects.toThrow();

    expect(notFound).toHaveBeenCalled();
  });
});
