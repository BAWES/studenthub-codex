"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Custom fallback UI. When provided, the default error state is not shown. */
  fallback?: ReactNode;
  /** Callback invoked when the error boundary catches an error. */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

/**
 * Shared error boundary for WorkspaceShell pages.
 *
 * Catches rendering errors in its subtree and displays a clean error state
 * matching the WorkspaceShell design, with a Try Again button and
 * dev-only error details.
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <WorkspaceShell ...>
 *     <Dashboard />
 *   </WorkspaceShell>
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log to console in all environments for debugging
    console.error("[ErrorBoundary]", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDev = process.env.NODE_ENV === "development";
      const error = this.state.error;

      return (
        <section
          className="flex flex-col items-center justify-center gap-4 p-16 text-center min-h-[300px]"
          role="alert"
          aria-live="assertive"
        >
          <span
            className="text-[2.5rem] leading-none"
            aria-hidden="true"
          >
            ⚠️
          </span>
          <h2 className="m-0 text-lg font-semibold">
            Something went wrong
          </h2>
          <p className="m-0 text-muted-foreground text-sm max-w-[480px]">
            An unexpected error occurred while rendering this page. Please try
            again, and if the problem persists contact support.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="mt-2 px-5 py-2 rounded-[6px] border border-border bg-accent text-accent-foreground font-medium text-sm cursor-pointer"
          >
            Try Again
          </button>
          {isDev && error && (
            <details className="mt-6 w-full max-w-[640px] text-left text-xs text-muted-foreground">
              <summary className="cursor-pointer font-medium">
                Error details (dev only)
              </summary>
              <pre className="mt-2 p-3 bg-muted rounded overflow-auto text-xs leading-relaxed whitespace-pre-wrap break-words">
                {error.name}: {error.message}
                {"\n\n"}
                {error.stack}
              </pre>
            </details>
          )}
        </section>
      );
    }

    return this.props.children;
  }
}
