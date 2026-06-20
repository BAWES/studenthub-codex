import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { AdminDegreeGroupsTable } from "./admin-degree-groups-table";

// Mock WorkspaceShell and DataTable
vi.mock("@/modules/workspace/WorkspaceShell", () => ({
  WorkspaceShell: ({
    children,
    eyebrow,
    title,
  }: {
    children: React.ReactNode;
    eyebrow: string;
    title: string;
  }) => (
    <div data-testid="workspace-shell">
      <div data-testid="eyebrow">{eyebrow}</div>
      <div data-testid="title">{title}</div>
      {children}
    </div>
  ),
}));

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
    columns: { key: string; label: string; render?: (row: Record<string, unknown>) => React.ReactNode }[];
  }) => (
    <div data-testid="data-table">
      <div data-testid="table-title">{title}</div>
      <div data-testid="table-desc">{description}</div>
      <div data-testid="table-rows">{rows.length}</div>
      <div data-testid="table-cols">{columns.length}</div>
      {rows.length > 0 && columns.map((col) => (
        <div key={col.key} data-testid={`col-${col.key}`}>
          {col.render ? col.render(rows[0]) : String(rows[0][col.key] ?? "")}
        </div>
      ))}
    </div>
  ),
}));

const CSS_VAR_PATTERNS = [
  "var(--surface)",
  "var(--border)",
  "var(--ink)",
];

const mockGroups = [
  {
    degree_group_uuid: "uuid-1",
    degree_group_name_en: "Science",
    degree_group_name_ar: "علوم",
    degree_group_sort_order: 1,
    skip_major: null,
    degree_group_created_at: new Date("2026-01-01"),
    degree_group_updated_at: null,
  },
  {
    degree_group_uuid: "uuid-2",
    degree_group_name_en: "Engineering",
    degree_group_name_ar: "الهندسة",
    degree_group_sort_order: 2,
    skip_major: 1,
    degree_group_created_at: new Date("2026-01-02"),
    degree_group_updated_at: null,
  },
];

describe("AdminDegreeGroupsTable — inline style audit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders degree groups and header", () => {
    render(
      <AdminDegreeGroupsTable
        session={{ user: { id: "1" } } as any}
        degreeGroups={mockGroups}
      />,
    );

    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin settings");
    expect(screen.getByTestId("title")).toHaveTextContent(/manage degree groups/i);
    expect(screen.getByTestId("table-title")).toHaveTextContent("Degree Groups");
    expect(screen.getByTestId("table-rows")).toHaveTextContent("2");
  });

  it("renders first degree group name in the table", () => {
    render(
      <AdminDegreeGroupsTable
        session={{ user: { id: "1" } } as any}
        degreeGroups={mockGroups}
      />,
    );

    expect(screen.getByText("Science")).toBeInTheDocument();
  });

  it("uses shadcn Input component instead of inline style on form inputs", () => {
    const { container } = render(
      <AdminDegreeGroupsTable
        session={{ user: { id: "1" } } as any}
        degreeGroups={mockGroups}
      />,
    );

    // Get all input and select elements
    const inputs = container.querySelectorAll("input, select");

    for (const el of Array.from(inputs)) {
      const classAttr = el.getAttribute("class") || "";
      const styleAttr = el.getAttribute("style") || "";

      // Input should NOT use CSS custom property classes for surface/border/ink
      for (const pattern of CSS_VAR_PATTERNS) {
        expect(classAttr).not.toContain(pattern);
        expect(styleAttr).not.toContain(pattern);
      }
    }
  });

  it("uses shadcn Badge/Tailwind classes for status indicators, not inline style or CSS vars", () => {
    const { container } = render(
      <AdminDegreeGroupsTable
        session={{ user: { id: "1" } } as any}
        degreeGroups={mockGroups}
      />,
    );

    // Check ALL elements (not just inputs) for CSS var usage in classes/styles
    const allElements = container.querySelectorAll("*");
    for (const el of Array.from(allElements)) {
      // Skip the wrapping divs that have data-testid
      if (el.getAttribute("data-testid")) continue;

      const classAttr = el.getAttribute("class") || "";
      const styleAttr = el.getAttribute("style") || "";

      // Only flag it if it contains the old patterns
      for (const pattern of CSS_VAR_PATTERNS) {
        if (classAttr.includes(pattern) || styleAttr.includes(pattern)) {
          // Report which element has the bad pattern
          const tagName = el.tagName.toLowerCase();
          const name = (el as HTMLElement).getAttribute("name") || "";
          throw new Error(
            `Element <${tagName}${name ? ` name="${name}"` : ""}> uses "${pattern}" in its class or style attribute. This should be replaced with a shadcn component or Tailwind CSS.`,
          );
        }
      }
    }
  });
});
