// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { ErrorBoundary } from "./ErrorBoundary";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const Bomb: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error("💥 test error");
  }
  return <p data-testid="safe">Rendered safely</p>;
};

// Spy on console.error so we don't pollute test output
beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ErrorBoundary", () => {
  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId("safe")).toHaveTextContent("Rendered safely");
    expect(screen.queryByRole("button", { name: /try again/i })).not.toBeInTheDocument();
  });

  it("catches rendering errors and shows the fallback UI", () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    );

    // Error message should be visible
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    // Try Again button should be present
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
    // Safe child should not render
    expect(screen.queryByTestId("safe")).not.toBeInTheDocument();
  });

  it("shows error details in development mode", () => {
    vi.stubEnv("NODE_ENV", "development");

    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/💥 test error/)).toBeInTheDocument();

    vi.unstubAllEnvs();
  });

  it("hides error details in production mode", () => {
    vi.stubEnv("NODE_ENV", "production");

    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    );

    expect(screen.queryByText(/💥 test error/)).not.toBeInTheDocument();

    vi.unstubAllEnvs();
  });

  it("re-renders children after clicking Try Again", () => {
    // We need a way to toggle the error
    let shouldThrow = true;

    const ToggleBomb = () => {
      if (shouldThrow) {
        throw new Error("💥");
      }
      return <p data-testid="recovered">Recovered!</p>;
    };

    render(
      <ErrorBoundary>
        <ToggleBomb />
      </ErrorBoundary>,
    );

    // Error is shown
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

    // Fix the error source
    shouldThrow = false;

    // Click Try Again
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    // Should now render the recovered content
    expect(screen.getByTestId("recovered")).toHaveTextContent("Recovered!");
  });

  it("accepts a custom fallback prop", () => {
    render(
      <ErrorBoundary {...{ fallback: <div data-testid="custom-fallback">Custom error UI</div>} as any}>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId("custom-fallback")).toHaveTextContent("Custom error UI");
    // Default fallback should not be shown
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
  });

  it("catches errors from async children", () => {
    // This tests that ErrorBoundary catches errors during render
    const AsyncBomb = () => {
      throw new Error("Network request failed");
    };

    render(
      <ErrorBoundary>
        <AsyncBomb />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
});
