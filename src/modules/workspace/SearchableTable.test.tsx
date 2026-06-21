// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { SearchableTable } from "./SearchableTable";

afterEach(cleanup);

// This component is tested without jest-dom matchers to keep deps light.
// Use vitest-native assertions: toBeNull, toBeTruthy, toContain, etc.

interface TestRow {
  id: number;
  name: string;
  email: string;
}

const rows: TestRow[] = [
  { id: 1, name: "Alice Smith", email: "alice@example.com" },
  { id: 2, name: "Bob Jones", email: "bob@test.org" },
  { id: 3, name: "Charlie Brown", email: "charlie@demo.net" },
];

const columns = [
  { key: "name", label: "Name", render: (r: TestRow) => r.name },
  { key: "email", label: "Email", render: (r: TestRow) => r.email },
];

describe("SearchableTable", () => {
  it("renders all rows when no query is entered", () => {
    render(
      <SearchableTable
        title="Test Table"
        description="Testing"
        rows={rows}
        columns={columns}
      />
    );

    expect(screen.queryByText("Alice Smith")).toBeTruthy();
    expect(screen.queryByText("Bob Jones")).toBeTruthy();
    expect(screen.queryByText("Charlie Brown")).toBeTruthy();
    expect(screen.getByText(/3 shown/)).toBeTruthy();
  });

  it("filters rows by search query", async () => {
    const user = userEvent.setup();
    render(
      <SearchableTable
        title="Test Table"
        description="Testing"
        rows={rows}
        columns={columns}
      />
    );

    const input = screen.getByPlaceholderText("Search…") as HTMLInputElement;
    await user.type(input, "alice");

    expect(screen.queryByText("Alice Smith")).toBeTruthy();
    expect(screen.queryByText("Bob Jones")).toBeNull();
    expect(screen.queryByText("Charlie Brown")).toBeNull();
    expect(screen.getByText(/1 shown/)).toBeTruthy();
  });

  it("searches across multiple columns by email domain", async () => {
    const user = userEvent.setup();
    render(
      <SearchableTable
        title="Test Table"
        description="Testing"
        rows={rows}
        columns={columns}
      />
    );

    const input = screen.getByPlaceholderText("Search…") as HTMLInputElement;
    await user.type(input, "example.com");

    expect(screen.queryByText("Alice Smith")).toBeTruthy();
    expect(screen.queryByText("Bob Jones")).toBeNull();
  });

  it("shows DataTable empty state when no results match", async () => {
    const user = userEvent.setup();
    render(
      <SearchableTable
        title="Test Table"
        description="Testing"
        rows={rows}
        columns={columns}
      />
    );

    const input = screen.getByPlaceholderText("Search…") as HTMLInputElement;
    await user.type(input, "zzzzzzz");

    expect(screen.getByText("No records found")).toBeTruthy();
  });

  it("accepts custom search placeholder", () => {
    render(
      <SearchableTable
        title="Test Table"
        description="Testing"
        rows={rows}
        columns={columns}
        searchPlaceholder="Filter by name…"
      />
    );

    expect(screen.queryByPlaceholderText("Filter by name…")).toBeTruthy();
    expect(screen.queryByPlaceholderText("Search…")).toBeNull();
  });
});
