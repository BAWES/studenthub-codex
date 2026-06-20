// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// Variant color rendering
// ---------------------------------------------------------------------------

describe("StatusBadge — variant color classes", () => {
  it("renders success variant with green styling", () => {
    render(<StatusBadge variant="success" label="Active" />);
    const badge = screen.getByText("Active");
    expect(badge.className).toMatch(/green/i);
  });

  it("renders warning variant with amber styling", () => {
    render(<StatusBadge variant="warning" label="Pending" />);
    const badge = screen.getByText("Pending");
    expect(badge.className).toMatch(/amber/i);
  });

  it("renders error variant with rose styling", () => {
    render(<StatusBadge variant="error" label="Failed" />);
    const badge = screen.getByText("Failed");
    expect(badge.className).toMatch(/rose/i);
  });

  it("renders info variant with blue styling", () => {
    render(<StatusBadge variant="info" label="Started" />);
    const badge = screen.getByText("Started");
    expect(badge.className).toMatch(/blue/i);
  });

  it("renders neutral variant with gray styling", () => {
    render(<StatusBadge variant="neutral" label="Draft" />);
    const badge = screen.getByText("Draft");
    expect(badge.className).toMatch(/gray/i);
  });

  it("defaults to neutral variant when no variant given", () => {
    render(<StatusBadge label="Default" />);
    const badge = screen.getByText("Default");
    expect(badge.className).toMatch(/gray/i);
  });
});

// ---------------------------------------------------------------------------
// Sizes
// ---------------------------------------------------------------------------

describe("StatusBadge — sizes", () => {
  it("renders sm size with text-xs", () => {
    render(<StatusBadge variant="info" label="Small" size="sm" />);
    const badge = screen.getByText("Small");
    expect(badge.className).toMatch(/text-xs/i);
  });

  it("renders md size with text-sm", () => {
    render(<StatusBadge variant="info" label="Medium" size="md" />);
    const badge = screen.getByText("Medium");
    expect(badge.className).toMatch(/text-sm/i);
  });

  it("defaults to md size", () => {
    render(<StatusBadge variant="info" label="Default" />);
    const badge = screen.getByText("Default");
    expect(badge.className).toMatch(/text-sm/i);
  });
});

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

describe("StatusBadge — states", () => {
  it("renders loading state with pulse animation", () => {
    const { container } = render(
      <StatusBadge variant="neutral" label="Loading" loading />,
    );
    const badge = screen.getByText("Loading");
    expect(badge.className).toMatch(/animate-pulse/i);
  });

  it("renders error state with error styling", () => {
    render(<StatusBadge variant="error" label="Error" />);
    const badge = screen.getByText("Error");
    expect(badge.className).toMatch(/rose/i);
  });
});

// ---------------------------------------------------------------------------
// Role-scoping via showDetails
// ---------------------------------------------------------------------------

describe("StatusBadge — role scoping", () => {
  it("renders additional context when showDetails is true", () => {
    render(
      <StatusBadge
        variant="success"
        label="Active"
        showDetails
        detail="Admin only info"
      />,
    );
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("(Admin only info)")).toBeInTheDocument();
  });

  it("does not render detail when showDetails is false", () => {
    const { container } = render(
      <StatusBadge
        variant="success"
        label="Active"
        showDetails={false}
        detail="Admin only info"
      />,
    );
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(container.textContent).not.toContain("Admin only info");
  });

  it("does not render detail when showDetails is undefined", () => {
    const { container } = render(
      <StatusBadge
        variant="success"
        label="Active"
        detail="Should not appear"
      />,
    );
    expect(container.textContent).not.toContain("Should not appear");
  });
});

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

describe("StatusBadge — accessibility", () => {
  it("renders as a span with role='status'", () => {
    render(<StatusBadge variant="success" label="Active" />);
    const badge = screen.getByRole("status");
    expect(badge).toBeInTheDocument();
  });

  it("displays human-readable label text", () => {
    render(<StatusBadge variant="info" label="In Progress" />);
    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// className passthrough
// ---------------------------------------------------------------------------

describe("StatusBadge — className passthrough", () => {
  it("applies additional className", () => {
    render(
      <StatusBadge
        variant="success"
        label="Active"
        className="custom-class"
      />,
    );
    const badge = screen.getByText("Active");
    expect(badge.className).toContain("custom-class");
  });
});
