// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { SwipeableRow } from "../swipeable-row";

const leftActions = [
  { label: "Edit", icon: "Pencil", variant: "info" as const, onAction: vi.fn() },
];

const rightActions = [
  { label: "Delete", icon: "Trash2", variant: "error" as const, onAction: vi.fn() },
];

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("SwipeableRow", () => {
  it("renders children content", () => {
    render(
      <SwipeableRow leftActions={leftActions}>
        <div data-testid="content">Row content</div>
      </SwipeableRow>,
    );

    expect(screen.getByTestId("content")).toHaveTextContent("Row content");
  });

  it("renders left action buttons", () => {
    render(
      <SwipeableRow leftActions={leftActions}>
        <div>Content</div>
      </SwipeableRow>,
    );

    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("renders right action buttons", () => {
    render(
      <SwipeableRow rightActions={rightActions}>
        <div>Content</div>
      </SwipeableRow>,
    );

    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("renders both left and right actions when provided", () => {
    render(
      <SwipeableRow leftActions={leftActions} rightActions={rightActions}>
        <div>Content</div>
      </SwipeableRow>,
    );

    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("calls left action handler when clicked", () => {
    render(
      <SwipeableRow leftActions={leftActions}>
        <div>Content</div>
      </SwipeableRow>,
    );

    fireEvent.click(screen.getByText("Edit"));
    expect(leftActions[0].onAction).toHaveBeenCalledTimes(1);
  });

  it("calls right action handler when clicked", () => {
    render(
      <SwipeableRow rightActions={rightActions}>
        <div>Content</div>
      </SwipeableRow>,
    );

    fireEvent.click(screen.getByText("Delete"));
    expect(rightActions[0].onAction).toHaveBeenCalledTimes(1);
  });

  it("does not render action container when no actions provided", () => {
    const { container } = render(
      <SwipeableRow>
        <div>Content</div>
      </SwipeableRow>,
    );

    // No action buttons should exist
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders with the shSwipeableRow CSS class", () => {
    const { container } = render(
      <SwipeableRow leftActions={leftActions}>
        <div>Content</div>
      </SwipeableRow>,
    );

    const row = container.firstElementChild;
    expect(row?.className).toContain("shSwipeableRow");
  });

  it("applies correct variant class to left actions", () => {
    render(
      <SwipeableRow leftActions={leftActions}>
        <div>Content</div>
      </SwipeableRow>,
    );

    // The button is a role="button" containing the text
    const editButton = screen.getByRole("button", { name: /edit/i });
    expect(editButton.className).toContain("shSwipeAction");
  });
});
