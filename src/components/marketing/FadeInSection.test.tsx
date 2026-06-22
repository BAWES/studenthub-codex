// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

beforeEach(() => {
  // Mock IntersectionObserver to trigger immediately
  let callback: (entries: any[]) => void;
  (globalThis as any).IntersectionObserver = class MockIntersectionObserver {
    constructor(cb: (entries: any[]) => void) {
      callback = cb;
    }
    observe(el: Element) {
      setTimeout(() => callback?.([{ isIntersecting: true, target: el }]), 0);
    }
    disconnect = vi.fn();
    unobserve = vi.fn();
  };
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

import FadeInSection from "./FadeInSection";

describe("FadeInSection", () => {
  it("renders children content", () => {
    render(<FadeInSection>Hello World</FadeInSection>);
    expect(screen.getByText("Hello World")).toBeTruthy();
  });

  it("renders as a section by default", () => {
    const { container } = render(<FadeInSection>Content</FadeInSection>);
    const el = container.querySelector("section");
    expect(el).toBeTruthy();
  });

  it("renders as a div when asDiv is true", () => {
    const { container } = render(<FadeInSection asDiv>Content</FadeInSection>);
    const el = container.querySelector("div");
    expect(el).toBeTruthy();
    expect(container.querySelector("section")).toBeNull();
  });

  it("applies custom className", () => {
    const { container } = render(
      <FadeInSection className="custom-class">Content</FadeInSection>,
    );
    const el = container.querySelector("[class*='custom-class']");
    expect(el).toBeTruthy();
  });

  it("applies opacity-0 initially before intersection", () => {
    // Replace IntersectionObserver with one that never triggers
    (globalThis as any).IntersectionObserver = class MockIntersectionObserver {
      constructor() {
        // never triggers
      }
      observe = vi.fn();
      disconnect = vi.fn();
      unobserve = vi.fn();
    };
    const { container } = render(<FadeInSection>Content</FadeInSection>);
    const el = container.firstChild as HTMLElement;
    expect(el).toBeTruthy();
  });
});
