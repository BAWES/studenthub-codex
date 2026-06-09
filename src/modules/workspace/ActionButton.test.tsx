import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActionButton } from "./ActionButton";
import { Plus } from "lucide-react";

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// ActionButton — shared action button with variants, icons, loading, and
// optional capability-based visibility.
// ---------------------------------------------------------------------------

describe("ActionButton", () => {
  it("renders children text", () => {
    render(<ActionButton>Click me</ActionButton>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("renders with default variant and size", () => {
    render(<ActionButton>Default</ActionButton>);
    const btn = screen.getByRole("button", { name: /default/i });
    expect(btn).toBeInTheDocument();
    expect(btn.className).toContain("uiButton");
  });

  it("accepts variant prop", () => {
    render(<ActionButton variant="danger">Danger</ActionButton>);
    const btn = screen.getByRole("button", { name: /danger/i });
    expect(btn.className).toContain("destructive");
  });

  it("accepts size prop", () => {
    render(<ActionButton size="lg">Large</ActionButton>);
    const btn = screen.getByRole("button", { name: /large/i });
    expect(btn.className).toContain("lg");
  });

  it("renders a leading icon before text", () => {
    const { container } = render(
      <ActionButton icon={<Plus data-testid="leading-icon" />} iconPosition="leading">
        Add
      </ActionButton>,
    );
    expect(screen.getByTestId("leading-icon")).toBeInTheDocument();
    expect(screen.getByText("Add")).toBeInTheDocument();
  });

  it("renders a trailing icon after text", () => {
    const { container } = render(
      <ActionButton icon={<Plus data-testid="trailing-icon" />} iconPosition="trailing">
        Next
      </ActionButton>,
    );
    expect(screen.getByTestId("trailing-icon")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
  });

  it("renders icon-only button without text", () => {
    render(
      <ActionButton icon={<Plus data-testid="icon-only" />} iconPosition="only" aria-label="Add item" />,
    );
    expect(screen.getByTestId("icon-only")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add item/i })).toBeInTheDocument();
  });

  it("shows loading spinner and disables button when loading", () => {
    render(<ActionButton loading>Save</ActionButton>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    // Loading indicator should render inside the button
    expect(btn.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("does not render children text while loading (replaced by spinner)", () => {
    render(<ActionButton loading>Save</ActionButton>);
    expect(screen.queryByText("Save")).not.toBeInTheDocument();
  });

  it("accepts disabled prop", () => {
    render(<ActionButton disabled>Disabled</ActionButton>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("fires onClick when clicked", async () => {
    const handler = vi.fn();
    render(<ActionButton onClick={handler}>Click</ActionButton>);
    await userEvent.click(screen.getByRole("button"));
    expect(handler).toHaveBeenCalledOnce();
  });

  it("does NOT fire onClick when disabled", async () => {
    const handler = vi.fn();
    render(<ActionButton disabled onClick={handler}>Click</ActionButton>);
    await userEvent.click(screen.getByRole("button"));
    expect(handler).not.toHaveBeenCalled();
  });

  it("does NOT fire onClick when loading", async () => {
    const handler = vi.fn();
    render(<ActionButton loading onClick={handler}>Click</ActionButton>);
    await userEvent.click(screen.getByRole("button"));
    expect(handler).not.toHaveBeenCalled();
  });

  it("applies additional className", () => {
    render(<ActionButton className="extra-class">Styled</ActionButton>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("extra-class");
  });

  it("forwards additional HTML button props", () => {
    render(<ActionButton data-testid="custom-btn">Custom</ActionButton>);
    expect(screen.getByTestId("custom-btn")).toBeInTheDocument();
  });
});
