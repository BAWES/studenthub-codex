// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it("renders status text", () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText("active")).toBeTruthy();
  });

  it("uses success variant for active status", () => {
    const { container } = render(<StatusBadge status="active" />);
    expect(container.firstChild?.textContent).toBe("active");
  });

  it("uses warning variant for pending status", () => {
    const { container } = render(<StatusBadge status="pending" />);
    expect(container.firstChild?.textContent).toBe("pending");
  });

  it("uses warning variant for in_progress status", () => {
    const { container } = render(<StatusBadge status="in_progress" />);
    expect(container.firstChild?.textContent).toBe("in_progress");
  });

  it("uses secondary variant for inactive status", () => {
    const { container } = render(<StatusBadge status="inactive" />);
    expect(container.firstChild?.textContent).toBe("inactive");
  });

  it("uses secondary variant for completed status", () => {
    const { container } = render(<StatusBadge status="completed" />);
    expect(container.firstChild?.textContent).toBe("completed");
  });

  it("uses default variant for unknown status", () => {
    const { container } = render(<StatusBadge status="unknown_value" />);
    expect(container.firstChild?.textContent).toBe("unknown_value");
  });
});
