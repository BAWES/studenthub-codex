// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { DataTable, type DataTableColumn } from "./DataTable";

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

type MockItem = { id: number; name: string; role: string };

const columns: DataTableColumn<MockItem>[] = [
  { key: "name", label: "Name", render: (row) => row.name },
  { key: "role", label: "Role", render: (row) => row.role },
];

const rows: MockItem[] = [
  { id: 1, name: "Alice", role: "Engineer" },
  { id: 2, name: "Bob", role: "Designer" },
];

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// Basic rendering
// ---------------------------------------------------------------------------

describe("DataTable — basic rendering", () => {
  it("renders title and description", () => {
    render(
      <DataTable
        title="Team Members"
        description="All active members"
        rows={rows}
        columns={columns}
      />,
    );
    expect(screen.getByText("Team Members")).toBeInTheDocument();
    expect(screen.getByText("All active members")).toBeInTheDocument();
  });

  it("renders column headers", () => {
    render(
      <DataTable title="Test" description="" rows={rows} columns={columns} />,
    );
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();
  });

  it("renders row data", () => {
    render(
      <DataTable title="Test" description="" rows={rows} columns={columns} />,
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("shows row count in the header", () => {
    render(
      <DataTable title="Test" description="" rows={rows} columns={columns} />,
    );
    expect(screen.getByText("2 shown")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Loading state
// ---------------------------------------------------------------------------

describe("DataTable — loading state", () => {
  it("renders skeleton rows when loading is true", () => {
    const { container } = render(
      <DataTable
        title="Test"
        description=""
        rows={[]}
        columns={columns}
        loading={true}
      />,
    );
    // Should show skeleton pulsing elements
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThanOrEqual(5);
  });

  it("does not render actual data when loading", () => {
    render(
      <DataTable
        title="Test"
        description=""
        rows={rows}
        columns={columns}
        loading={true}
      />,
    );
    expect(screen.queryByText("Alice")).not.toBeInTheDocument();
  });

  it("renders skeleton count matching columns * 5", () => {
    const { container } = render(
      <DataTable
        title="Test"
        description=""
        rows={[]}
        columns={columns}
        loading={true}
      />,
    );
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    // 5 rows * 2 columns = 10 skeleton cells minimum
    expect(skeletons.length).toBeGreaterThanOrEqual(10);
  });

  it("uses loadingSkeletonRows prop when provided", () => {
    const { container } = render(
      <DataTable
        title="Test"
        description=""
        rows={[]}
        columns={columns}
        loading={true}
        loadingSkeletonRows={2}
      />,
    );
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThanOrEqual(4);
  });
});

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

describe("DataTable — empty state", () => {
  it("renders default empty state when rows is empty", () => {
    render(
      <DataTable title="Test" description="" rows={[]} columns={columns} />,
    );
    expect(
      screen.getByText(
        "This view is connected to the prod clone, but this account has no matching rows yet.",
      ),
    ).toBeInTheDocument();
  });

  it("renders custom empty message when provided", () => {
    render(
      <DataTable
        title="Test"
        description=""
        rows={[]}
        columns={columns}
        emptyMessage="No team members yet"
      />,
    );
    expect(screen.getByText("No team members yet")).toBeInTheDocument();
  });

  it("renders empty action CTA when provided", () => {
    render(
      <DataTable
        title="Test"
        description=""
        rows={[]}
        columns={columns}
        emptyAction={{ label: "Add Member", onClick: () => {} }}
      />,
    );
    expect(screen.getByText("Add Member")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------

describe("DataTable — error state", () => {
  it("renders error message when error prop is set", () => {
    render(
      <DataTable
        title="Test"
        description=""
        rows={[]}
        columns={columns}
        error="Failed to load data"
      />,
    );
    expect(screen.getByText("Failed to load data")).toBeInTheDocument();
  });

  it("renders retry button when onRetry is provided", () => {
    render(
      <DataTable
        title="Test"
        description=""
        rows={[]}
        columns={columns}
        error="Something went wrong"
        onRetry={() => {}}
      />,
    );
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("calls onRetry when retry button is clicked", () => {
    const onRetry = vi.fn();
    render(
      <DataTable
        title="Test"
        description=""
        rows={[]}
        columns={columns}
        error="Error"
        onRetry={onRetry}
      />,
    );
    fireEvent.click(screen.getByText("Retry"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("does not render retry button without onRetry callback", () => {
    render(
      <DataTable
        title="Test"
        description=""
        rows={[]}
        columns={columns}
        error="Error"
      />,
    );
    expect(screen.queryByText("Retry")).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

describe("DataTable — pagination", () => {
  it("does not show pagination when totalPages <= 1", () => {
    render(
      <DataTable
        title="Test"
        description=""
        rows={rows}
        columns={columns}
        totalPages={1}
      />,
    );
    expect(screen.queryByText("Previous")).not.toBeInTheDocument();
    expect(screen.queryByText("Next")).not.toBeInTheDocument();
  });

  it("shows pagination controls when totalPages > 1", () => {
    render(
      <DataTable
        title="Test"
        description=""
        rows={rows}
        columns={columns}
        totalPages={5}
        page={1}
        onPageChange={() => {}}
      />,
    );
    expect(screen.getByText("Next")).toBeInTheDocument();
  });

  it("disables Previous on first page", () => {
    render(
      <DataTable
        title="Test"
        description=""
        rows={rows}
        columns={columns}
        totalPages={5}
        page={1}
        onPageChange={() => {}}
      />,
    );
    const prev = screen.getByText("Previous").closest("button");
    expect(prev).toBeDisabled();
  });

  it("disables Next on last page", () => {
    render(
      <DataTable
        title="Test"
        description=""
        rows={rows}
        columns={columns}
        totalPages={5}
        page={5}
        onPageChange={() => {}}
      />,
    );
    const next = screen.getByText("Next").closest("button");
    expect(next).toBeDisabled();
  });

  it("calls onPageChange with next page when Next is clicked", () => {
    const onPageChange = vi.fn();
    render(
      <DataTable
        title="Test"
        description=""
        rows={rows}
        columns={columns}
        totalPages={5}
        page={1}
        onPageChange={onPageChange}
      />,
    );
    fireEvent.click(screen.getByText("Next"));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("calls onPageChange with previous page when Previous is clicked", () => {
    const onPageChange = vi.fn();
    render(
      <DataTable
        title="Test"
        description=""
        rows={rows}
        columns={columns}
        totalPages={5}
        page={3}
        onPageChange={onPageChange}
      />,
    );
    fireEvent.click(screen.getByText("Previous"));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("renders page number indicator", () => {
    render(
      <DataTable
        title="Test"
        description=""
        rows={rows}
        columns={columns}
        totalPages={5}
        page={3}
        onPageChange={() => {}}
      />,
    );
    expect(screen.getByText("Page 3 of 5")).toBeInTheDocument();
  });

  it("shows pagination with pageSize override in count display", () => {
    render(
      <DataTable
        title="Test"
        description=""
        rows={rows}
        columns={columns}
        totalPages={2}
        page={1}
        onPageChange={() => {}}
        pageSize={10}
      />,
    );
    // Should show 10 per page in the row count
    expect(screen.getByText(/2.*shown.*10.*page/)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Interaction: error takes precedence over empty
// ---------------------------------------------------------------------------

describe("DataTable — state precedence", () => {
  it("shows error when both error and empty conditions apply", () => {
    render(
      <DataTable
        title="Test"
        description=""
        rows={[]}
        columns={columns}
        error="Critical failure"
      />,
    );
    expect(screen.getByText("Critical failure")).toBeInTheDocument();
  });

  it("shows loading when loading is true even with error", () => {
    const { container } = render(
      <DataTable
        title="Test"
        description=""
        rows={[]}
        columns={columns}
        loading={true}
        error="Error but loading"
      />,
    );
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
    expect(screen.queryByText("Error but loading")).not.toBeInTheDocument();
  });
});
