// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { PageTransition } from "./PageTransition";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

let mockPathname = "/admin/candidates";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setPathname(p: string) {
  mockPathname = p;
}

describe("PageTransition", () => {
  beforeEach(() => {
    cleanup();
    setPathname("/admin/candidates");
  });

  it("renders children", () => {
    render(<PageTransition>Hello world</PageTransition>);
    expect(screen.getByText("Hello world")).toBeTruthy();
  });

  it("applies pageEnter class on render", () => {
    const { container } = render(<PageTransition>Content</PageTransition>);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain("pageEnter");
  });

  it("re-renders with new key on pathname change", () => {
    const { container, rerender } = render(
      <PageTransition key="first">Content</PageTransition>
    );

    // Get the initial key element
    const firstDiv = container.firstChild as HTMLElement;
    expect(firstDiv.className).toContain("pageEnter");

    // Change pathname and re-render (simulating route change)
    setPathname("/admin/requests");
    const { container: container2 } = render(
      <PageTransition key="second">Content</PageTransition>
    );

    // New div should also have pageEnter class (enter animation for the new route)
    const secondDiv = container2.firstChild as HTMLElement;
    expect(secondDiv.className).toContain("pageEnter");
  });

  it("renders multiple children correctly", () => {
    render(
      <PageTransition>
        <span data-testid="child1">Child 1</span>
        <span data-testid="child2">Child 2</span>
      </PageTransition>
    );
    expect(screen.getByText("Child 1")).toBeTruthy();
    expect(screen.getByText("Child 2")).toBeTruthy();
  });
});
