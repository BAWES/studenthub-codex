// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Mock server actions
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

vi.mock("@/modules/admin/salary-scales/actions", () => ({
  createSalaryScale: (...args: unknown[]) => mockCreate(...args),
  updateSalaryScale: (...args: unknown[]) => mockUpdate(...args),
  deleteSalaryScale: (...args: unknown[]) => mockDelete(...args),
}));

// Mock next/navigation
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

// Mock WorkspaceShell
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

// Mock DataTable
vi.mock("@/modules/workspace/DataTable", () => ({
  DataTable: ({
    title,
    description,
    rows,
    columns,
  }: {
    title: string;
    description: string;
    rows: Record<string, unknown>[];
    columns: { key: string; label: string; render: (row: any) => React.ReactNode }[];
  }) => (
    <div data-testid="data-table">
      <div data-testid="table-title">{title}</div>
      <div data-testid="table-description">{description}</div>
      <div data-testid="table-rows-count">{rows.length}</div>
      {rows.map((row, i) => (
        <div key={row.salary_scale_id as string} data-testid={`row-${row.salary_scale_id}`}>
          {columns.map((col) => (
            <span key={col.key} data-testid={`cell-${row.salary_scale_id}-${col.key}`}>
              {col.render(row)}
            </span>
          ))}
        </div>
      ))}
    </div>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    type,
    disabled,
    onClick,
  }: {
    children: React.ReactNode;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    onClick?: () => void;
  }) => (
    <button type={type ?? "button"} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/input", () => ({
  Input: (props: Record<string, unknown>) => (
    <input {...props} data-testid={`input-${String(props.name ?? "")}`} />
  ),
}));

vi.mock("@/components/ui/label", () => ({
  Label: ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

import { AdminSalaryScalesTable } from "../admin-salary-scales-table";
import type { SessionUser } from "@/modules/auth/types";
import type { SalaryScaleListItem } from "@/modules/admin/salary-scales/schemas";

const mockSession = { user: { id: "1" }, role: "admin" } as unknown as SessionUser;

const baseRecords: SalaryScaleListItem[] = [
  {
    salary_scale_id: 1,
    salary_scale_name_en: "Grade A",
    salary_scale_name_ar: "الدرجة أ",
    salary_scale_min_amount: 500,
    salary_scale_max_amount: 1500,
    candidate_count: 0,
  },
  {
    salary_scale_id: 2,
    salary_scale_name_en: "Grade B",
    salary_scale_name_ar: null,
    salary_scale_min_amount: null,
    salary_scale_max_amount: null,
    candidate_count: null,
  },
];

describe("AdminSalaryScalesTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the workspace shell with title and metrics", () => {
    render(<AdminSalaryScalesTable session={mockSession} records={baseRecords} />);

    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin settings");
    expect(screen.getByTestId("metric-Scales")).toHaveTextContent("2");
  });

  it("renders all records in the data table", () => {
    render(<AdminSalaryScalesTable session={mockSession} records={baseRecords} />);

    expect(screen.getByTestId("table-rows-count")).toHaveTextContent("2");
    expect(screen.getByTestId("cell-1-salary_scale_name_en")).toHaveTextContent("Grade A");
    expect(screen.getByTestId("cell-2-salary_scale_name_en")).toHaveTextContent("Grade B");
  });

  it("renders Arabic names", () => {
    render(<AdminSalaryScalesTable session={mockSession} records={baseRecords} />);

    expect(screen.getByTestId("cell-1-salary_scale_name_ar")).toHaveTextContent("الدرجة أ");
    expect(screen.getByTestId("cell-2-salary_scale_name_ar")).toHaveTextContent("—");
  });

  it("shows create form with all inputs", () => {
    render(<AdminSalaryScalesTable session={mockSession} records={baseRecords} />);

    expect(screen.getByText("Add salary scale")).toBeInTheDocument();
    expect(screen.getByTestId("input-nameEn")).toBeInTheDocument();
    expect(screen.getByTestId("input-nameAr")).toBeInTheDocument();
    expect(screen.getByTestId("input-minAmount")).toBeInTheDocument();
    expect(screen.getByTestId("input-maxAmount")).toBeInTheDocument();
    expect(screen.getByText("Add")).toBeInTheDocument();
  });

  it("renders a delete button per row", () => {
    render(<AdminSalaryScalesTable session={mockSession} records={baseRecords} />);

    const deleteButtons = screen.getAllByText("Delete");
    expect(deleteButtons).toHaveLength(2);
  });

  it("shows inline edit form when clicking a name", () => {
    render(<AdminSalaryScalesTable session={mockSession} records={baseRecords} />);

    fireEvent.click(screen.getByText("Grade A"));

    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("hides Save/Cancel when clicking Cancel", () => {
    render(<AdminSalaryScalesTable session={mockSession} records={baseRecords} />);

    fireEvent.click(screen.getByText("Grade A"));
    expect(screen.getByText("Save")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByText("Save")).not.toBeInTheDocument();
  });

  it("renders dash for null min/max amounts", () => {
    render(<AdminSalaryScalesTable session={mockSession} records={baseRecords} />);

    expect(screen.getByTestId("cell-2-salary_scale_min_amount")).toHaveTextContent("—");
    expect(screen.getByTestId("cell-2-salary_scale_max_amount")).toHaveTextContent("—");
  });

  it("renders formatted amount for valid min/max", () => {
    render(<AdminSalaryScalesTable session={mockSession} records={baseRecords} />);

    expect(screen.getByTestId("cell-1-salary_scale_min_amount")).toHaveTextContent("500.000");
    expect(screen.getByTestId("cell-1-salary_scale_max_amount")).toHaveTextContent("1500.000");
  });
});
