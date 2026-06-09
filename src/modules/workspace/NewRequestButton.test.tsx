import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NewRequestButton } from "./NewRequestButton";

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// NewRequestButton — convenience button for creating new requests, wrapping
// ActionButton with request.create capability check and plus icon.
// ---------------------------------------------------------------------------

describe("NewRequestButton", () => {
  it("renders with default label", () => {
    render(<NewRequestButton />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders with a custom label when provided", () => {
    render(<NewRequestButton label="Create Position" />);
    expect(screen.getByRole("button", { name: /create position/i })).toBeInTheDocument();
  });

  it("fires onClick when clicked", async () => {
    const handler = vi.fn();
    render(<NewRequestButton onClick={handler} />);
    await userEvent.click(screen.getByRole("button"));
    expect(handler).toHaveBeenCalledOnce();
  });

  it("applies additional className", () => {
    render(<NewRequestButton className="my-class" />);
    expect(screen.getByRole("button").className).toContain("my-class");
  });

  it("forwards aria-label", () => {
    render(<NewRequestButton aria-label="Start a new request" />);
    expect(
      screen.getByRole("button", { name: /start a new request/i }),
    ).toBeInTheDocument();
  });
});
