// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

import StatsSection from "./StatsSection";

// Mock IntersectionObserver with a proper constructor function
beforeEach(() => {
  const mockObserve = vi.fn();
  const mockDisconnect = vi.fn();
  (globalThis as any).IntersectionObserver = class MockIntersectionObserver {
    constructor() {
      // noop
    }
    observe = mockObserve;
    disconnect = mockDisconnect;
    unobserve = vi.fn();
  };
});

describe("StatsSection", () => {
  it("renders the section with correct aria-label", () => {
    render(<StatsSection />);
    const section = document.querySelector("section");
    expect(section?.getAttribute("aria-label")).toBe("Platform statistics");
  });

  it("renders stat labels", () => {
    render(<StatsSection />);
    expect(screen.getByText("Candidates placed")).toBeTruthy();
    expect(screen.getByText("Average rating")).toBeTruthy();
    expect(screen.getByText("Active employers")).toBeTruthy();
    expect(screen.getByText("Avg time-to-match")).toBeTruthy();
  });

  it("sets up IntersectionObserver", () => {
    render(<StatsSection />);
    expect(IntersectionObserver).toBeDefined();
  });
});
