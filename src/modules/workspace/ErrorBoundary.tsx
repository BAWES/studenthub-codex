"use client";

import type { ReactNode } from "react";
import { Component } from "react";

// ── Props / State ─────────────────────────────────────────────

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional label to qualify the error context */
  label?: string;
  /** Optional retry handler */
  onRetry?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// ── Component ────────────────────────────────────────────────

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.state.error?.message === "ROUTER_ABORT") {
      return null;
    }

    return <DefaultErrorFallback error={this.state.error} onRetry={this.handleRetry} />;
  }
}

// ── Default Fallback ─────────────────────────────────────────

interface FallbackProps {
  error: Error | null;
  onRetry: () => void;
}

function DefaultErrorFallback({ error, onRetry }: FallbackProps) {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <section
      className="flex flex-col items-center justify-center p-16 gap-4 text-center min-h-[300px]"
      role="alert"
      aria-live="assertive"
    >
      <span aria-hidden="true" className="text-[2.5rem] leading-none">
        ⚠️
      </span>
      <h2 className="m-0 text-xl font-semibold">
        Something went wrong
      </h2>
      <p className="m-0 text-muted-foreground max-w-[480px] text-sm">
        An unexpected error occurred while rendering this page. Please try
        again, and if the problem persists contact support.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 px-5 py-2 rounded-md border border-border bg-accent text-accent-foreground font-medium text-sm cursor-pointer"
      >
        Try Again
      </button>
      {isDev && error && (
        <details
          className="mt-6 w-full max-w-[640px] text-left text-xs text-muted-foreground"
        >
          <summary className="cursor-pointer font-medium text-sm">
            Error details (dev only)
          </summary>
          <pre
            className="mt-2 p-3 bg-muted rounded overflow-auto text-xs leading-relaxed whitespace-pre-wrap"
          >
            {error.stack || error.message}
          </pre>
        </details>
      )}
    </section>
  );
}
