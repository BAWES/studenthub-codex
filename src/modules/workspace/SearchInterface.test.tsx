// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchInterface } from "./SearchInterface";

afterEach(() => { cleanup(); });

describe("SearchInterface", () => {
  it("renders the search input", () => {
    render(
      <SearchInterface
        query=""
        onQueryChange={() => {}}
        onSearch={() => {}}
      />
    );
    expect(screen.getByPlaceholderText("Search...")).toBeDefined();
  });

  it("shows the current query value", () => {
    render(
      <SearchInterface
        query="Alice"
        onQueryChange={() => {}}
        onSearch={() => {}}
      />
    );
    const input = screen.getByPlaceholderText("Search...") as HTMLInputElement;
    expect(input.value).toBe("Alice");
  });

  it("calls onSearch when Enter is pressed", async () => {
    const onSearch = vi.fn();
    render(
      <SearchInterface
        query="test"
        onQueryChange={() => {}}
        onSearch={onSearch}
      />
    );
    const input = screen.getByPlaceholderText("Search...");
    await userEvent.type(input, "{enter}");
    expect(onSearch).toHaveBeenCalledOnce();
  });

  it("renders quick filter chips when provided", () => {
    const chips = [
      { id: "active", label: "Active" },
      { id: "pending", label: "Pending" },
    ];
    render(
      <SearchInterface
        query=""
        onQueryChange={() => {}}
        onSearch={() => {}}
        quickFilters={chips}
        activeFilter="active"
        onFilterChange={() => {}}
      />
    );
    expect(screen.getByText("Active")).toBeDefined();
    expect(screen.getByText("Pending")).toBeDefined();
  });

  it("renders advanced filter toggle when filters are provided", async () => {
    const filters = [
      { key: "status", label: "Status", options: ["Active", "Inactive"] },
    ];
    render(
      <SearchInterface
        query=""
        onQueryChange={() => {}}
        onSearch={() => {}}
        filters={filters}
        filterValues={{}}
        onFilterChange={() => {}}
      />
    );
    await userEvent.click(screen.getByText("Filters"));
    expect(screen.getByText("Status")).toBeDefined();
  });

  it("renders saved searches when provided", () => {
    const saved = [
      { id: "s1", name: "Active Candidates", query: "active" },
      { id: "s2", name: "Pending Review", query: "pending" },
    ];
    render(
      <SearchInterface
        query=""
        onQueryChange={() => {}}
        onSearch={() => {}}
        savedSearches={saved}
        onSavedSearchSelect={() => {}}
      />
    );
    expect(screen.getByText("Active Candidates")).toBeDefined();
    expect(screen.getByText("Pending Review")).toBeDefined();
  });

  it("shows search results count when provided", () => {
    render(
      <SearchInterface
        query="test"
        onQueryChange={() => {}}
        onSearch={() => {}}
        resultsCount={42}
      />
    );
    expect(screen.getByText("42 results")).toBeDefined();
  });
});
