// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, within, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTablePage } from "./DataTablePage";
import type { DataTableColumn } from "./DataTablePage";

const mockColumns: DataTableColumn<{ id: number; name: string; email: string }>[] = [
  { key: "name", label: "Name", render: (r) => r.name },
  { key: "email", label: "Email", render: (r) => r.email },
];

const mockRows = [
  { id: 1, name: "Alice", email: "alice@test.com" },
  { id: 2, name: "Bob", email: "bob@test.com" },
];

function renderPage(props?: Record<string, unknown>) {
  return render(
    <DataTablePage
      title="Candidates"
      description="All candidates in the system"
      columns={mockColumns}
      rows={mockRows}
      {...props}
    />
  );
}

describe("DataTablePage", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the title and description", () => {
    renderPage();
    // Title appears in both DataTablePage header and inner DataTable header
    const headers = screen.getAllByText("Candidates");
    expect(headers.length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("All candidates in the system").length).toBeGreaterThanOrEqual(1);
  });

  it("renders table rows in the data table", () => {
    renderPage();
    expect(screen.getByText("Alice")).toBeDefined();
    expect(screen.getByText("Bob")).toBeDefined();
  });

  it("shows loading skeleton when loading is true", () => {
    const { container } = renderPage({ loading: true, rows: [] });
    const skeleton = container.querySelector('[data-slot="skeleton"]');
    expect(skeleton).toBeTruthy();
  });

  it("shows empty state when no rows and not loading", () => {
    renderPage({ rows: [] });
    expect(screen.getByText("No records found")).toBeDefined();
  });

  it("shows error state when error prop is provided", () => {
    renderPage({
      rows: [],
      error: "Failed to load data",
      columns: mockColumns,
    });
    expect(screen.getByText("Error loading data")).toBeDefined();
    expect(screen.getByText("Failed to load data")).toBeDefined();
  });

  it("filters rows by search query", async () => {
    renderPage({ searchable: true });
    const input = screen.getByPlaceholderText("Search...");
    await userEvent.type(input, "Alice");

    // After filtering, only Alice should be in the table body
    const table = screen.getByRole("table");
    const bodyRows = table.querySelectorAll("tbody tr");
    expect(bodyRows.length).toBe(1);
    expect(bodyRows[0]?.textContent).toContain("Alice");
  });

  it("renders pagination controls when totalPages > 1", () => {
    renderPage({
      totalPages: 3,
      page: 1,
      onPageChange: () => {},
    });
    expect(screen.getByText("Page 1 of 3")).toBeDefined();
  });

  it("renders action buttons when provided", () => {
    renderPage({ actions: <button>Create</button> });
    expect(screen.getByText("Create")).toBeDefined();
  });

  it("renders search bar when searchable is true", () => {
    renderPage({ searchable: true });
    expect(screen.getByPlaceholderText("Search...")).toBeDefined();
  });

  it("does not render search bar when searchable is false", () => {
    renderPage({ searchable: false });
    expect(screen.queryByPlaceholderText("Search...")).toBeNull();
  });

  it("disables previous button on first page", () => {
    renderPage({
      totalPages: 3,
      page: 1,
      onPageChange: () => {},
    });
    const prev = screen.getByText("Previous").closest("button");
    expect(prev?.disabled).toBe(true);
  });

  it("disables next button on last page", () => {
    renderPage({
      totalPages: 3,
      page: 3,
      onPageChange: () => {},
    });
    const next = screen.getByText("Next").closest("button");
    expect(next?.disabled).toBe(true);
  });
});
