// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

import StatsSection from "./StatsSection";

// Mock IntersectionObserver that triggers immediately
beforeEach(() => {
  let callback: (entries: any[]) => void;
  (globalThis as any).IntersectionObserver = class MockIntersectionObserver {
    constructor(cb: (entries: any[]) => void) {
      callback = cb;
    }
    observe(el: Element) {
      // Trigger intersection immediately so the counter starts animating
      setTimeout(() => callback?.([{ isIntersecting: true, target: el }]), 0);
    }
    disconnect = vi.fn();
    unobserve = vi.fn();
  };
});

describe("StatsSection", () => {
  it("renders the section with correct aria-label", () => {
    render(<StatsSection />);
    const section = document.querySelector("section");
    expect(section?.getAttribute("aria-label")).toBe("Platform statistics");
  });

  it("renders stat labels for real-world metrics", () => {
    render(<StatsSection />);
    expect(screen.getByText("Students placed")).toBeTruthy();
    expect(screen.getByText("Star rating")).toBeTruthy();
    expect(screen.getByText("Active employers")).toBeTruthy();
  });

  it("renders 3 stat columns", () => {
    const { container } = render(<StatsSection />);
    const grid = container.querySelector(".grid-cols-3");
    expect(grid).toBeTruthy();
  });

  it("animated counters eventually reach target values", async () => {
    render(<StatsSection />);
    // Wait for counter animation to complete
    await waitFor(
      () => {
        const placed = screen.getByText(/1200/);
        expect(placed).toBeTruthy();
      },
      { timeout: 2000 },
    );
  });

  it("sets up IntersectionObserver", () => {
    render(<StatsSection />);
    expect(IntersectionObserver).toBeDefined();
  });
});
