import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ErrorBoundary, ErrorBoundaryProps } from "./ErrorBoundary";
import React from "react";

// ---------------------------------------------------------------------------
// A component that throws on render
// ---------------------------------------------------------------------------

function BrokenComponent({ shouldThrow = false }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error("Something went wrong!");
  }
  return <p>All good</p>;
}

function renderErrorBoundary(props: Partial<ErrorBoundaryProps> = {}) {
  return render(
    <ErrorBoundary {...props}>
      <BrokenComponent shouldThrow={false} />
    </ErrorBoundary>,
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ErrorBoundary", () => {
  afterEach(cleanup);

  it("renders children when there is no error", () => {
    renderErrorBoundary();
    expect(screen.getByText("All good")).toBeTruthy();
  });

  it("renders fallback UI when a child throws", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeTruthy();
    expect(screen.getByText("Try again")).toBeTruthy();

    consoleSpy.mockRestore();
  });

  it("shows custom fallback when provided", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary
        fallback={
          <div>
            <h2>Custom error page</h2>
            <button>Custom retry</button>
          </div>
        }
      >
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Custom error page")).toBeTruthy();

    consoleSpy.mockRestore();
  });

  it("calls onError when a child throws", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      }),
    );

    consoleSpy.mockRestore();
  });

  it("resets and re-renders children when resetKey changes", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { rerender } = render(
      <ErrorBoundary resetKey="error">
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    // Error state shown
    expect(screen.getByText("Something went wrong")).toBeTruthy();

    // Change the resetKey — should re-attempt rendering children
    rerender(
      <ErrorBoundary resetKey="ok">
        <BrokenComponent shouldThrow={false} />
      </ErrorBoundary>,
    );

    // Child should render again
    expect(screen.getByText("All good")).toBeTruthy();

    consoleSpy.mockRestore();
  });
});
