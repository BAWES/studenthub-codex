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
          className="workspaceError"
          role="alert"
          aria-live="assertive"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "4rem 2rem",
            gap: "1rem",
            textAlign: "center",
            minHeight: "300px",
          }}
        >
          <span
            aria-hidden="true"
            style={{ fontSize: "2.5rem", lineHeight: 1 }}
          >
            ⚠️
          </span>
          <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>
            Something went wrong
          </h2>
          <p
            style={{
              margin: 0,
              color: "var(--muted-foreground, #6b7280)",
              maxWidth: "480px",
              fontSize: "0.875rem",
            }}
          >
            An unexpected error occurred while rendering this page. Please try
            again, and if the problem persists contact support.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            style={{
              marginTop: "0.5rem",
              padding: "0.5rem 1.25rem",
              borderRadius: "6px",
              border: "1px solid var(--border, #e5e7eb)",
              background: "var(--accent, #f3f4f6)",
              color: "var(--accent-foreground, #111827)",
              fontWeight: 500,
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
          {isDev && error && (
            <details
              style={{
                marginTop: "1.5rem",
                width: "100%",
                maxWidth: "640px",
                textAlign: "left",
                fontSize: "0.8rem",
                color: "var(--muted-foreground, #6b7280)",
              }}
            >
              <summary style={{ cursor: "pointer", fontWeight: 500 }}>
                Error details (dev only)
              </summary>
              <pre
                style={{
                  marginTop: "0.5rem",
                  padding: "0.75rem",
                  background: "var(--muted, #f9fafb)",
                  borderRadius: "4px",
                  overflow: "auto",
                  fontSize: "0.75rem",
                  lineHeight: 1.4,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
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
