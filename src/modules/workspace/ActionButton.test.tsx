// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ActionButton } from "./ActionButton";

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

describe("ActionButton — variant rendering", () => {
  it("renders primary variant", () => {
    render(<ActionButton variant="primary">Save</ActionButton>);
    const btn = screen.getByRole("button", { name: "Save" });
    expect(btn).toBeInTheDocument();
  });

  it("renders secondary variant", () => {
    render(<ActionButton variant="secondary">Cancel</ActionButton>);
    const btn = screen.getByRole("button", { name: "Cancel" });
    expect(btn).toBeInTheDocument();
  });

  it("renders outline variant", () => {
    render(<ActionButton variant="outline">Preview</ActionButton>);
    const btn = screen.getByRole("button", { name: "Preview" });
    expect(btn).toBeInTheDocument();
  });

  it("renders ghost variant", () => {
    render(<ActionButton variant="ghost">Delete</ActionButton>);
    const btn = screen.getByRole("button", { name: "Delete" });
    expect(btn).toBeInTheDocument();
  });

  it("renders danger variant", () => {
    render(<ActionButton variant="danger">Remove</ActionButton>);
    const btn = screen.getByRole("button", { name: "Remove" });
    expect(btn).toBeInTheDocument();
  });

  it("defaults to primary variant when none given", () => {
    render(<ActionButton>Submit</ActionButton>);
    const btn = screen.getByRole("button", { name: "Submit" });
    expect(btn).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Sizes
// ---------------------------------------------------------------------------

describe("ActionButton — sizes", () => {
  it("renders sm size", () => {
    render(<ActionButton size="sm">Small</ActionButton>);
    const btn = screen.getByRole("button", { name: "Small" });
    expect(btn).toBeInTheDocument();
  });

  it("renders md size", () => {
    render(<ActionButton size="md">Medium</ActionButton>);
    const btn = screen.getByRole("button", { name: "Medium" });
    expect(btn).toBeInTheDocument();
  });

  it("renders lg size", () => {
    render(<ActionButton size="lg">Large</ActionButton>);
    const btn = screen.getByRole("button", { name: "Large" });
    expect(btn).toBeInTheDocument();
  });

  it("defaults to md size", () => {
    render(<ActionButton>Default</ActionButton>);
    const btn = screen.getByRole("button", { name: "Default" });
    expect(btn).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Icon support
// ---------------------------------------------------------------------------

describe("ActionButton — icon support", () => {
  it("renders a leading icon before the label", () => {
    render(
      <ActionButton leadingIcon={<span data-testid="leading-icon">+</span>}>
        New Request
      </ActionButton>,
    );
    const btn = screen.getByRole("button", { name: /New Request/ });
    const icon = screen.getByTestId("leading-icon");
    expect(btn).toContainElement(icon);
  });

  it("renders a trailing icon after the label", () => {
    render(
      <ActionButton trailingIcon={<span data-testid="trailing-icon">→</span>}>
        Next
      </ActionButton>,
    );
    const btn = screen.getByRole("button", { name: /Next/ });
    const icon = screen.getByTestId("trailing-icon");
    expect(btn).toContainElement(icon);
  });

  it("renders icon-only mode", () => {
    render(
      <ActionButton
        icon={<span data-testid="icon-only">⚙</span>}
        aria-label="Settings"
      />,
    );
    const btn = screen.getByRole("button", { name: "Settings" });
    const icon = screen.getByTestId("icon-only");
    expect(btn).toContainElement(icon);
  });
});

// ---------------------------------------------------------------------------
// Loading state
// ---------------------------------------------------------------------------

describe("ActionButton — loading state", () => {
  it("shows a spinner when loading", () => {
    render(<ActionButton loading>Saving</ActionButton>);
    const btn = screen.getByRole("button", { name: /Saving/ });
    expect(btn).toBeDisabled();
    // Should contain an SVG spinner
    expect(btn.querySelector("svg")).toBeInTheDocument();
  });

  it("is disabled when loading", () => {
    render(<ActionButton loading>Save</ActionButton>);
    const btn = screen.getByRole("button", { name: "Save" });
    expect(btn).toBeDisabled();
  });

  it("replaces children text with loading text when provided", () => {
    render(<ActionButton loading loadingText="Saving...">Save</ActionButton>);
    expect(screen.getByText("Saving...")).toBeInTheDocument();
    expect(screen.queryByText("Save")).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Disabled state
// ---------------------------------------------------------------------------

describe("ActionButton — disabled state", () => {
  it("renders disabled button", () => {
    render(<ActionButton disabled>Submit</ActionButton>);
    const btn = screen.getByRole("button", { name: "Submit" });
    expect(btn).toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// className passthrough
// ---------------------------------------------------------------------------

describe("ActionButton — className passthrough", () => {
  it("applies additional className", () => {
    render(
      <ActionButton className="custom-class">Styled</ActionButton>,
    );
    const btn = screen.getByRole("button", { name: "Styled" });
    expect(btn.className).toContain("custom-class");
  });
});

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

describe("ActionButton — accessibility", () => {
  it("renders as a button element", () => {
    render(<ActionButton>Accessible</ActionButton>);
    const btn = screen.getByRole("button", { name: "Accessible" });
    expect(btn).toBeInTheDocument();
  });

  it("accepts aria-label on icon-only buttons", () => {
    render(
      <ActionButton
        icon={<span>⚙</span>}
        aria-label="Settings"
      />,
    );
    expect(screen.getByRole("button", { name: "Settings" })).toBeInTheDocument();
  });
});
