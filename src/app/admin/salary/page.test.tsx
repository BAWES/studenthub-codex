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
    facts?: { label: string; value: string | React.ReactNode }[];
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

vi.mock("@/modules/workspace/DataTable", () => ({
  DataTable: ({
    title,
    description,
    columns,
    rows,
  }: {
    title: string;
    description: string;
    columns: { key: string; label: string; render: (row: any) => React.ReactNode }[];
    rows: any[];
  }) => (
    <div data-testid="data-table">
      <div data-testid="table-title">{title}</div>
      <div data-testid="table-description">{description}</div>
      <div data-testid="table-columns">
        {columns.map((col) => (
          <span key={col.key} data-testid={`col-${col.key}`}>
            {col.label}
          </span>
        ))}
      </div>
      <div data-testid="table-rows">
        {rows.map((row) => (
          <div key={row.id} data-testid={`row-${row.id}`}>
            {columns.map((col) => (
              <span key={col.key} data-testid={`cell-${row.id}-${col.key}`}>
                {col.render(row)}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  ),
}));

vi.mock("@/modules/workspace/DataTableSkeleton", () => ({
  DataTableSkeleton: ({ rows }: { rows: number }) => (
    <div data-testid="skeleton">{rows} rows</div>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Import after mocks
import { AdminSalaryTable } from "./_components/admin-salary-table";

const mockSalaries = [
  {
    staff_salary_uuid: "SAL-001",
    salary: 2500,
    salary_currency: "KWD",
    comment: "Monthly salary",
    salary_date: new Date("2026-06-01"),
  },
  {
    staff_salary_uuid: "SAL-002",
    salary: null,
    salary_currency: null,
    comment: null,
    salary_date: null,
  },
];

type SessionUser = { user: { id: string }; role: string };
const mockSession: SessionUser = { user: { id: "1" }, role: "admin" };

describe("AdminSalaryTable", () => {
  beforeEach(() => {
    cleanup();
  });

  it("renders the workspace shell with title and eyebrow", () => {
    render(<AdminSalaryTable session={mockSession} salaries={[]} total={0} />);
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin settings");
    expect(screen.getByTestId("title")).toHaveTextContent(/salaries/i);
  });

  it("displays total salary count in metrics", () => {
    render(<AdminSalaryTable session={mockSession} salaries={[]} total={42} />);
    expect(screen.getByTestId("metric-Total salaries")).toHaveTextContent("42");
  });

  it("renders the DataTable with correct columns", () => {
    render(<AdminSalaryTable session={mockSession} salaries={[]} total={0} />);
    expect(screen.getByTestId("col-salary")).toHaveTextContent("Salary");
    expect(screen.getByTestId("col-comment")).toHaveTextContent("Comment");
    expect(screen.getByTestId("col-salary_date")).toHaveTextContent("Date");
  });

  it("renders salary rows with formatted values", () => {
    render(
      <AdminSalaryTable
        session={mockSession}
        salaries={mockSalaries}
        total={2}
      />,
    );
    expect(screen.getByTestId("row-SAL-001")).toBeInTheDocument();
    expect(screen.getByTestId("row-SAL-002")).toBeInTheDocument();
  });

  it("formats salary with currency", () => {
    render(
      <AdminSalaryTable session={mockSession} salaries={[mockSalaries[0]]} total={1} />,
    );
    const cell = screen.getByTestId("cell-SAL-001-salary");
    expect(cell.textContent).toContain("2,500");
    expect(cell.textContent).toContain("KWD");
  });

  it("shows em-dash for null salary", () => {
    render(
      <AdminSalaryTable session={mockSession} salaries={[mockSalaries[1]]} total={1} />,
    );
    const cell = screen.getByTestId("cell-SAL-002-salary");
    expect(cell.textContent).toBe("\u2014");
  });

  it("shows em-dash for null comment", () => {
    render(
      <AdminSalaryTable session={mockSession} salaries={[mockSalaries[1]]} total={1} />,
    );
    const cell = screen.getByTestId("cell-SAL-002-comment");
    expect(cell.textContent).toBe("\u2014");
  });

  it("shows em-dash for null salary_date", () => {
    render(
      <AdminSalaryTable session={mockSession} salaries={[mockSalaries[1]]} total={1} />,
    );
    const cell = screen.getByTestId("cell-SAL-002-salary_date");
    expect(cell.textContent).toBe("\u2014");
  });

  it("formats salary_date into locale date string", () => {
    render(
      <AdminSalaryTable session={mockSession} salaries={[mockSalaries[0]]} total={1} />,
    );
    const cell = screen.getByTestId("cell-SAL-001-salary_date");
    expect(cell.textContent).toMatch(/2026/);
  });
});
