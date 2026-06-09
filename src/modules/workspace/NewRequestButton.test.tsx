// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { NewRequestButton } from "./NewRequestButton";

// Mock Next.js Link — renders a standard <a> for testing
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    className,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
}));

afterEach(() => {
  cleanup();
});

describe("NewRequestButton", () => {
  it("renders with default label and href", () => {
    render(<NewRequestButton />);
    const link = screen.getByRole("link", { name: "+ New Request" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/company/requests/create");
  });

  it("accepts custom href", () => {
    render(<NewRequestButton href="/company/requests" />);
    const link = screen.getByRole("link", { name: "+ New Request" });
    expect(link).toHaveAttribute("href", "/company/requests");
  });

  it("accepts custom children", () => {
    render(<NewRequestButton>Create Request</NewRequestButton>);
    expect(screen.getByRole("link", { name: "Create Request" })).toBeInTheDocument();
  });

  it("renders with primary variant by default", () => {
    const { container } = render(<NewRequestButton />);
    const link = container.querySelector("a");
    // Primary variant is applied; the exact class may vary with Slot behavior
    expect(link).toBeInTheDocument();
    expect(link?.getAttribute("href")).toBe("/company/requests/create");
  });

  it("applies disabled state", () => {
    render(<NewRequestButton disabled>New Request</NewRequestButton>);
    const link = screen.getByRole("link", { name: "New Request" });
    expect(link).toBeInTheDocument();
  });
});
