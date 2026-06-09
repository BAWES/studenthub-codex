"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ErrorBoundaryProps {
  /** The content to render when no error has occurred. */
  children: ReactNode;
  /** Optional custom fallback UI. Defaults to a styled error card. */
  fallback?: ReactNode;
  /** Optional callback invoked with the error and stack info. */
  onError?: (error: Error, info: ErrorInfo) => void;
  /**
   * Key to trigger a reset. When this key changes, the boundary
   * re-attempts rendering children. Useful when the parent can
   * coordinate a recovery (e.g. a new `resourceId`).
   */
  resetKey?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// ---------------------------------------------------------------------------
// Default fallback UI
// ---------------------------------------------------------------------------

function DefaultFallback({
  error,
  onRetry,
}: {
  error: Error | null;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center"
    >
      <div className="text-4xl">⚠️</div>
      <h2 className="text-xl font-semibold text-foreground">
        Something went wrong
      </h2>
      <p className="max-w-md text-sm text-muted-foreground">
        {error?.message || "An unexpected error occurred. Please try again."}
      </p>
      <div className="flex gap-3">
        <Button onClick={onRetry} variant="secondary">
          Try again
        </Button>
        <Button
          onClick={() => {
            if (typeof window !== "undefined") {
              window.history.back();
            }
          }}
          variant="outline"
        >
          Go back
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ErrorBoundary
// ---------------------------------------------------------------------------

/**
 * A React error boundary that catches JavaScript errors in its child
 * component tree, logs them for debugging, and displays a fallback UI.
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary onError={(err) => logger.error(err)}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 *
 * To make the boundary retryable when the error condition changes, pass
 * a `resetKey` that changes with the source of the error:
 * ```tsx
 * <ErrorBoundary resetKey={candidateId}>
 *   <CandidateProfile id={candidateId} />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Log the error for debugging
    console.error("[ErrorBoundary]", error, info.componentStack);
    this.props.onError?.(error, info);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset when resetKey changes (parent signals recovery)
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <DefaultFallback
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}
