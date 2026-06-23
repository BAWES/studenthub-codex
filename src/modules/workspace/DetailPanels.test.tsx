// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { DetailSection, FactPanel, CompactList } from "./DetailPanels";

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// DetailSection — render modes
// ---------------------------------------------------------------------------

describe("DetailSection — type='fact' (default)", () => {
  const sampleFacts = [
    { label: "Name", value: "Alice" },
    { label: "Email", value: "alice@example.com" },
    { label: "Empty", value: null },
    { label: "Sensitive", value: "secret123", sensitive: true },
  ];

  it("renders title and facts", () => {
    render(<DetailSection title="Details" facts={sampleFacts} />);
    expect(screen.getByText("Details")).toBeTruthy();
    expect(screen.getByText("Name")).toBeTruthy();
    expect(screen.getByText("Alice")).toBeTruthy();
  });

  it("shows 'Not set' for null/undefined values", () => {
    render(<DetailSection title="Details" facts={sampleFacts} />);
    expect(screen.getByText("Not set")).toBeTruthy();
  });

  it("shows empty state when facts array is empty", () => {
    render(<DetailSection title="Details" facts={[]} />);
    expect(screen.getByText("No data for this section.")).toBeTruthy();
  });

  it("shows custom empty message", () => {
    render(<DetailSection title="Details" facts={[]} emptyMessage="Nothing here yet." />);
    expect(screen.getByText("Nothing here yet.")).toBeTruthy();
  });

  it("shows 'Show sensitive' button when sensitive facts exist", () => {
    render(<DetailSection title="Details" facts={sampleFacts} sensitive />);
    expect(screen.getByText("Show sensitive")).toBeTruthy();
  });

  it("hides sensitive values behind dots when not revealed", () => {
    render(<DetailSection title="Details" facts={sampleFacts} sensitive />);
    const dots = screen.getAllByText("•••••");
    expect(dots.length).toBeGreaterThanOrEqual(1);
  });

  it("reveals sensitive values on toggle click", () => {
    render(<DetailSection title="Details" facts={sampleFacts} sensitive />);
    fireEvent.click(screen.getByText("Show sensitive"));
    expect(screen.getByText("secret123")).toBeTruthy();
  });
});

describe("DetailSection — type='list'", () => {
  const sampleRows = [
    { id: 1, title: "First Item", subtitle: "Subtitle A", meta: "3" },
    { id: 2, title: "Second Item", subtitle: "Subtitle B", href: "/details/2" },
  ];

  it("renders title and rows", () => {
    render(<DetailSection type="list" title="Items" rows={sampleRows} />);
    expect(screen.getByText("Items")).toBeTruthy();
    expect(screen.getByText("First Item")).toBeTruthy();
    expect(screen.getByText("Second Item")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
  });

  it("shows row count badge", () => {
    render(<DetailSection type="list" title="Items" rows={sampleRows} />);
    expect(screen.getByText("2")).toBeTruthy();
  });

  it("renders rows with href as links", () => {
    render(<DetailSection type="list" title="Items" rows={sampleRows} />);
    const link = screen.getByText("Second Item").closest("a");
    expect(link?.getAttribute("href")).toBe("/details/2");
  });

  it("shows empty state when rows are empty", () => {
    render(<DetailSection type="list" title="Items" rows={[]} />);
    expect(screen.getByText("No imported records found here yet.")).toBeTruthy();
  });

  it("shows custom empty message for list", () => {
    render(<DetailSection type="list" title="Items" rows={[]} emptyMessage="No records found." />);
    expect(screen.getByText("No records found.")).toBeTruthy();
  });
});

describe("DetailSection — loading state", () => {
  it("renders skeleton for fact type", () => {
    const { container } = render(<DetailSection title="Details" loading facts={[]} />);
    expect(container.querySelector('[aria-busy="true"]')).toBeTruthy();
    // Should not show empty state while loading
    expect(screen.queryByText("No data for this section.")).toBeNull();
  });

  it("renders skeleton for list type", () => {
    const { container } = render(<DetailSection type="list" title="Items" loading rows={[]} />);
    expect(container.querySelector('[aria-busy="true"]')).toBeTruthy();
    expect(screen.queryByText("No imported records found here yet.")).toBeNull();
  });
});

describe("DetailSection — error state", () => {
  it("renders error message from string", () => {
    render(<DetailSection title="Details" error="Something went wrong." />);
    expect(screen.getByText("Something went wrong.")).toBeTruthy();
  });

  it("renders error message from Error object", () => {
    render(<DetailSection title="Details" error={new Error("Network failure")} />);
    expect(screen.getByText("Network failure")).toBeTruthy();
  });

  it("shows retry button when onRetry is provided", () => {
    const onRetry = vi.fn();
    render(<DetailSection title="Details" error="Fail" onRetry={onRetry} />);
    fireEvent.click(screen.getByText("Try again"));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("does not show retry button when onRetry is omitted", () => {
    render(<DetailSection title="Details" error="Fail" />);
    expect(screen.queryByText("Try again")).toBeNull();
  });
});

describe("DetailSection — hidden prop", () => {
  it("renders nothing when hidden is true", () => {
    const { container } = render(<DetailSection title="Secret" hidden facts={[{ label: "X", value: "Y" }]} />);
    expect(container.textContent).toBe("");
  });
});

// ---------------------------------------------------------------------------
// Deprecated wrappers (backward compat)
// ---------------------------------------------------------------------------

describe("FactPanel (deprecated wrapper)", () => {
  it("renders same output as DetailSection type=fact", () => {
    render(<FactPanel title="Legacy" facts={[{ label: "Key", value: "Val" }]} />);
    expect(screen.getByText("Legacy")).toBeTruthy();
    expect(screen.getByText("Val")).toBeTruthy();
  });
});

describe("CompactList (deprecated wrapper)", () => {
  it("renders same output as DetailSection type=list", () => {
    render(<CompactList title="Legacy" rows={[{ id: 1, title: "T", subtitle: "S" }]} />);
    expect(screen.getByText("Legacy")).toBeTruthy();
    expect(screen.getByText("T")).toBeTruthy();
  });
});
