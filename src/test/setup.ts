import "@testing-library/jest-dom/vitest";

// Mock IntersectionObserver for MetricCard entrance animation
if (typeof globalThis.IntersectionObserver === "undefined") {
  globalThis.IntersectionObserver = class MockIntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = "0px";
    readonly thresholds: ReadonlyArray<number> = [0];

    constructor(private callback: IntersectionObserverCallback) {}

    observe(target: Element) {
      // Immediately trigger as visible so tests aren't waiting on layout
      this.callback(
        [{ isIntersecting: true, target } as IntersectionObserverEntry],
        this,
      );
    }

    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  } as unknown as typeof IntersectionObserver;
}
