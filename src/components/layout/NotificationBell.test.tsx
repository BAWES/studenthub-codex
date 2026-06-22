import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationBell } from "./NotificationBell";

describe("NotificationBell", () => {
  beforeEach(() => {
    cleanup();
  });

  it("renders bell icon", () => {
    const { container } = render(<NotificationBell count={0} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("does not show badge when count is 0", () => {
    const { container } = render(<NotificationBell count={0} />);
    expect(container.querySelector('[data-testid="notification-badge"]')).not.toBeInTheDocument();
  });

  it("shows badge when count is greater than 0", () => {
    const { container } = render(<NotificationBell count={5} />);
    expect(container.querySelector('[data-testid="notification-badge"]')).toHaveTextContent("5");
  });

  it("shows 99+ when count exceeds 99", () => {
    const { container } = render(<NotificationBell count={150} />);
    expect(container.querySelector('[data-testid="notification-badge"]')).toHaveTextContent("99+");
  });

  it("uses correct accessible label with count", () => {
    const { container } = render(<NotificationBell count={3} />);
    const buttons = container.querySelectorAll("button");
    const bellBtn = Array.from(buttons).find(
      (b) => b.getAttribute("aria-label") === "Notifications (3 unread)",
    );
    expect(bellBtn).toBeInTheDocument();
  });

  it("uses correct accessible label for zero count", () => {
    const { container } = render(<NotificationBell count={0} />);
    const buttons = container.querySelectorAll("button");
    const bellBtn = Array.from(buttons).find(
      (b) => b.getAttribute("aria-label") === "Notifications",
    );
    expect(bellBtn).toBeInTheDocument();
  });

  it("calls onClick when button is clicked", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<NotificationBell count={3} onClick={onClick} />);
    const buttons = container.querySelectorAll("button");
    await user.click(buttons[0]);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
