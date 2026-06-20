import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { AdminEmailCampaignsTable } from "./admin-email-campaigns-table";

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

const mockCampaigns = [
  {
    campaign_uuid: "camp-1",
    subject: "New opportunities",
    message: "Dear candidate...",
    progress: 75,
    target: "candidate",
    status: true,
    created_at: new Date("2026-01-15T10:00:00Z"),
  },
  {
    campaign_uuid: "camp-2",
    subject: "Inactive campaign",
    message: null,
    progress: null,
    target: "both",
    status: false,
    created_at: null,
  },
];

describe("AdminEmailCampaignsTable — inline style audit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders campaigns and header", () => {
    render(
      <AdminEmailCampaignsTable
        session={{ user: { id: "1" } } as any}
        campaigns={mockCampaigns}
      />,
    );

    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin settings");
    expect(screen.getByTestId("title")).toHaveTextContent(/email campaigns/i);
    expect(screen.getByTestId("table-title")).toHaveTextContent("Email campaigns");
    expect(screen.getByTestId("table-rows")).toHaveTextContent("2");
  });

  it("renders campaign subject", () => {
    render(
      <AdminEmailCampaignsTable
        session={{ user: { id: "1" } } as any}
        campaigns={mockCampaigns}
      />,
    );

    expect(screen.getByText("New opportunities")).toBeInTheDocument();
  });

  it("uses shadcn Input component instead of inline style on form inputs", () => {
    const { container } = render(
      <AdminEmailCampaignsTable
        session={{ user: { id: "1" } } as any}
        campaigns={mockCampaigns}
      />,
    );

    const inputs = container.querySelectorAll("input, select");

    for (const el of Array.from(inputs)) {
      const classAttr = el.getAttribute("class") || "";
      const styleAttr = el.getAttribute("style") || "";

      for (const pattern of CSS_VAR_PATTERNS) {
        expect(classAttr).not.toContain(pattern);
        expect(styleAttr).not.toContain(pattern);
      }
    }
  });

  it("uses shadcn Badge for status instead of inline style background/color", () => {
    const { container } = render(
      <AdminEmailCampaignsTable
        session={{ user: { id: "1" } } as any}
        campaigns={mockCampaigns}
      />,
    );

    const allElements = container.querySelectorAll("*");
    for (const el of Array.from(allElements)) {
      if (el.getAttribute("data-testid")) continue;

      const classAttr = el.getAttribute("class") || "";
      const styleAttr = el.getAttribute("style") || "";

      // Check for the old CSS var patterns
      for (const pattern of CSS_VAR_PATTERNS) {
        if (classAttr.includes(pattern) || styleAttr.includes(pattern)) {
          const tagName = el.tagName.toLowerCase();
          const name = (el as HTMLElement).getAttribute("name") || "";
          throw new Error(
            `Element <${tagName}${name ? ` name="${name}"` : ""}> uses "${pattern}" in class or style. Replace with shadcn component.`,
          );
        }
      }

      // Also check for the old rgba/rgb inline style pattern used in status badge
      if (styleAttr.includes("rgba(34, 197, 94") || styleAttr.includes("rgb(34, 197, 94)")) {
        throw new Error(
          `Element <${el.tagName.toLowerCase()}> uses legacy inline style for status badge. Replace with shadcn Badge component.`,
        );
      }
    }
  });
});
