// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import React from "react";
import type { Route } from "next";
import { DataTable, type DataTableColumn } from "./DataTable";

afterEach(cleanup);

// Using createElement instead of JSX to avoid tsconfig "jsx: preserve" conflict

const columns: DataTableColumn<{ id: string | number; name?: string; email?: string; status?: string; [key: string]: unknown }>[] = [
  { key: "name", label: "Name", render: (row: { name?: unknown }) => React.createElement("strong", null, String(row.name ?? "")) },
  { key: "email", label: "Email", render: (row: { email?: unknown }) => String(row.email ?? "") as unknown as React.ReactNode },
  { key: "status", label: "Status", render: (row: { status?: unknown }) => React.createElement("span", null, String(row.status ?? "")) },
];

interface TestRow {
  id: string | number;
  [key: string]: unknown;
}

const rows: TestRow[] = [
  { id: "1", name: "Alpha Corp", email: "alpha@test.com", status: "active" },
  { id: "2", name: "Beta Inc", email: "beta@test.com", status: "pending" },
  { id: "3", name: "Gamma Ltd", email: "gamma@test.com", status: "inactive" },
];

function renderTable(extraProps?: Record<string, unknown>) {
  return render(
    React.createElement(DataTable, {
      title: "Companies",
      description: "Test description",
      rows: rows,
      columns: columns,
      ...extraProps,
    }),
  );
}

function renderEmptyTable() {
  return render(
    React.createElement(DataTable, {
      title: "Companies",
      description: "Test description",
      rows: [],
      columns,
    }),
  );
}

describe("DataTable", () => {
  it("renders column headers", () => {
    renderEmptyTable();
    for (const col of columns) {
      expect(screen.getByText(col.label)).toBeTruthy();
    }
  });

  it("renders the title and description", () => {
    renderEmptyTable();
    expect(screen.getByText("Companies")).toBeTruthy();
    expect(screen.getByText("Test description")).toBeTruthy();
  });

  it("renders a row count badge", () => {
    renderTable();
    expect(screen.getByText("3 shown")).toBeTruthy();
  });

  it("renders all data rows", () => {
    renderTable();
    for (const row of rows) {
      expect(screen.getByText(row.name as string)).toBeTruthy();
      expect(screen.getByText(row.email as string)).toBeTruthy();
    }
  });

  it("renders empty state when no rows", () => {
    renderEmptyTable();
    expect(screen.getByText("No records found")).toBeTruthy();
  });

  it("renders row href links when rowHref is provided", () => {
    renderTable({ rowHref: (row: TestRow) => `/admin/${row.id}` as unknown as Route });
    const links = screen.getAllByRole("link", { name: "Open" });
    expect(links).toHaveLength(3);
    expect(links[0].getAttribute("href")).toBe("/admin/1");
    expect(links[1].getAttribute("href")).toBe("/admin/2");
    expect(links[2].getAttribute("href")).toBe("/admin/3");
  });

  it("does not render action column when rowHref is omitted", () => {
    renderTable();
    expect(screen.queryByRole("link", { name: "Open" })).toBeNull();
  });

  // ── Keyboard navigation support ──────────────────────────────

  it("attaches data-os-navigable to each data row for j/k keyboard nav", () => {
    renderTable();
    const rows = screen.getAllByRole("row");
    // rows[0] = thead row, rows[1..3] = tbody data rows
    const dataRows = rows.slice(1);
    expect(dataRows).toHaveLength(3);
    for (const row of dataRows) {
      // React renders boolean HTML attributes as the string "true"
      expect(row.getAttribute("data-os-navigable")).toBe("true");
    }
  });

  it("sets tabIndex={0} on each data row for focusability", () => {
    renderTable();
    const rows = screen.getAllByRole("row");
    const dataRows = rows.slice(1);
    for (const row of dataRows) {
      expect(row.getAttribute("tabindex")).toBe("0");
    }
  });

  it("does NOT attach data-os-navigable to the empty-state row", () => {
    renderEmptyTable();
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(2); // header row + empty state row
    const emptyRow = rows[1];
    expect(emptyRow.getAttribute("data-os-navigable")).toBeNull();
  });
});
