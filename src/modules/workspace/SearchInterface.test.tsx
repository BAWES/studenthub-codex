// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchInterface } from "./SearchInterface";

afterEach(() => { cleanup(); });

// ── Helpers ────────────────────────────────────────────────

function minimalProps() {
  return { query: "", onQueryChange: () => {}, onSearch: () => {} };
}

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

  // ── Loading state (STU-899) ───────────────────────────────

  it("disables search input when loading is true", () => {
    render(<SearchInterface {...minimalProps()} query="hello" loading />);
    const input = screen.getByPlaceholderText("Search...") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("shows spinner icon instead of search icon when loading", () => {
    render(<SearchInterface {...minimalProps()} loading />);
    // The spinner should have aria-label="Loading"
    expect(screen.getByLabelText("Loading")).toBeDefined();
    // The search icon has aria-hidden — it's not queryable via accessibility.
    // Verify the input is disabled as proof of loading state.
    const input = screen.getByPlaceholderText("Search...") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("disables quick filter chips when loading", () => {
    const chips = [{ id: "all", label: "All" }, { id: "active", label: "Active" }];
    render(
      <SearchInterface
        {...minimalProps()}
        loading
        quickFilters={chips}
        activeFilter="all"
        onFilterChange={() => {}}
      />
    );
    // Quick filter chips are <button> elements with quickFilterChip class
    const chipButtons = screen.getAllByRole("button").filter(
      (btn) => btn.className.includes("quickFilterChip")
    );
    expect(chipButtons).toHaveLength(2);
    chipButtons.forEach((btn) => {
      expect((btn as HTMLButtonElement).disabled).toBe(true);
    });
  });

  it("does not show empty results when loading is true", () => {
    render(<SearchInterface {...minimalProps()} loading emptyResults="No matches" />);
    // The empty results text should NOT appear while loading
    expect(screen.queryByText("No matches")).toBeNull();
  });

  // ── Empty results state (STU-899) ─────────────────────────

  it("shows empty results message when provided and not loading", () => {
    render(<SearchInterface {...minimalProps()} emptyResults="No candidates found" />);
    expect(screen.getByText("No candidates found")).toBeDefined();
  });

  it("renders empty results with icon by default", () => {
    render(<SearchInterface {...minimalProps()} emptyResults="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeDefined();
    // Should have a search icon nearby
    expect(screen.getByLabelText("No results")).toBeDefined();
  });

  it("does not show empty results when query is empty and no explicit emptyResults", () => {
    render(<SearchInterface {...minimalProps()} query="" />);
    // Default: no empty state shown until there's a query with empty results
    expect(screen.queryByText(/no/i)).toBeNull();
  });
});
