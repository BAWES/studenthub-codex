// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Mock server actions
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

vi.mock("@/modules/admin/university/actions", () => ({
  createUniversity: (...args: unknown[]) => mockCreate(...args),
  updateUniversity: (...args: unknown[]) => mockUpdate(...args),
  deleteUniversity: (...args: unknown[]) => mockDelete(...args),
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
        <div key={row.university_id as string} data-testid={`row-${row.university_id}`}>
          {columns.map((col) => (
            <span key={col.key} data-testid={`cell-${row.university_id}-${col.key}`}>
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
    variant,
    size,
  }: {
    children: React.ReactNode;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    onClick?: () => void;
    variant?: string;
    size?: string;
  }) => (
    <button
      type={type ?? "button"}
      disabled={disabled}
      onClick={onClick}
      data-variant={variant}
      data-size={size}
    >
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
  Label: ({ children, htmlFor, ...props }: { children: React.ReactNode; htmlFor?: string }) => (
    <label htmlFor={htmlFor} {...props}>
      {children}
    </label>
  ),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

import { AdminUniversityTable } from "../admin-university-table";
import type { SessionUser } from "@/modules/auth/types";
import type { UniversityListItem } from "@/modules/admin/university/schemas";

const mockSession = { user: { id: "1" }, role: "admin" } as unknown as SessionUser;

const baseRecords: UniversityListItem[] = [
  {
    university_id: 1,
    university_name_en: "Kuwait University",
    university_name_ar: "جامعة الكويت",
    university_data_source: 1,
    candidate_count: 100,
  },
  {
    university_id: 2,
    university_name_en: "American University of Kuwait",
    university_name_ar: "الجامعة الأميركية في الكويت",
    university_data_source: 2,
    candidate_count: 50,
  },
];

describe("AdminUniversityTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the workspace shell with title and metrics", () => {
    render(<AdminUniversityTable session={mockSession} records={baseRecords} />);

    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin settings");
    expect(screen.getByTestId("title")).toHaveTextContent("Universities");
    expect(screen.getByTestId("metric-Universities")).toHaveTextContent("2");
  });

  it("renders all records in the data table", () => {
    render(<AdminUniversityTable session={mockSession} records={baseRecords} />);

    expect(screen.getByTestId("table-rows-count")).toHaveTextContent("2");
    expect(screen.getByTestId("cell-1-university_name_en")).toHaveTextContent("Kuwait University");
    expect(screen.getByTestId("cell-2-university_name_en")).toHaveTextContent("American University of Kuwait");
  });

  it("renders Arabic names", () => {
    render(<AdminUniversityTable session={mockSession} records={baseRecords} />);

    expect(screen.getByTestId("cell-1-university_name_ar")).toHaveTextContent("جامعة الكويت");
    expect(screen.getByTestId("cell-2-university_name_ar")).toHaveTextContent("الجامعة الأميركية في الكويت");
  });

  it("shows create university form with English and Arabic inputs", () => {
    render(<AdminUniversityTable session={mockSession} records={baseRecords} />);

    expect(screen.getByText("Add university")).toBeInTheDocument();
    expect(screen.getByTestId("input-university_name_en")).toBeInTheDocument();
    expect(screen.getByTestId("input-university_name_ar")).toBeInTheDocument();
    expect(screen.getByText("Add University")).toBeInTheDocument();
  });

  it("renders a delete button per row", () => {
    render(<AdminUniversityTable session={mockSession} records={baseRecords} />);

    const deleteButtons = screen.getAllByText("Delete");
    expect(deleteButtons).toHaveLength(2);
  });

  it("shows inline edit form when clicking a university name", () => {
    render(<AdminUniversityTable session={mockSession} records={baseRecords} />);

    // Click on "Kuwait University" to trigger inline edit
    fireEvent.click(screen.getByText("Kuwait University"));

    // Should show Save and Cancel buttons
    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();

    // Delete button for this row should be hidden when editing
    const allDeleteButtons = screen.getAllByText("Delete");
    expect(allDeleteButtons).toHaveLength(1); // only the other row still shows it
  });

  it("hides Save/Cancel when clicking Cancel", () => {
    render(<AdminUniversityTable session={mockSession} records={baseRecords} />);

    // Click to start editing
    fireEvent.click(screen.getByText("Kuwait University"));
    expect(screen.getByText("Save")).toBeInTheDocument();

    // Click Cancel
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByText("Save")).not.toBeInTheDocument();
  });

  it("calls updateUniversity on Save with correct data", async () => {
    mockUpdate.mockResolvedValue({ university_id: 1 });

    render(<AdminUniversityTable session={mockSession} records={baseRecords} />);

    // Click to start editing
    fireEvent.click(screen.getByText("Kuwait University"));

    // Change the English name
    const nameInput = screen.getByTestId("input-nameEn");
    fireEvent.change(nameInput, { target: { value: "KU" } });

    // Click Save
    fireEvent.click(screen.getByText("Save"));

    // Wait for async action
    await vi.waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        university_id: 1,
        university_name_en: "KU",
        university_name_ar: "جامعة الكويت",
      });
    });
  });

  it("renders dash for university with null name", () => {
    const nullRecord: UniversityListItem[] = [
      {
        university_id: 3,
        university_name_en: null,
        university_name_ar: null,
        university_data_source: null,
        candidate_count: 0,
      },
    ];

    render(<AdminUniversityTable session={mockSession} records={nullRecord} />);

    expect(screen.getByTestId("cell-3-university_name_en")).toHaveTextContent("—");
  });
});
