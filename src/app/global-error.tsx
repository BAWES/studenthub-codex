"use client";

import { useEffect } from "react";

/**
 * Global error boundary — catches errors thrown in the root layout itself.
 *
 * Next.js App Router distinguishes two error boundaries at the root:
 *  - error.tsx       — catches errors in the root layout's children
 *  - global-error.tsx — catches errors in the root LAYOUT (e.g. ThemeScript,
 *                        TooltipProvider, Toaster). Because it replaces the
 *                        entire <html> document, it must include its own
 *                        <html> and <body> tags.
 *
 * Without this file, a crash in the root layout produces a silent white screen
 * or a Next.js dev overlay in development — no user-friendly fallback.
 */

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console for debugging
    console.error("Global error boundary caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="global-error-page">
          {/* Decorative gradient */}
          <div className="global-error-gradient" aria-hidden="true" />

          <div className="global-error-content">
            <h1 className="global-error-code">500</h1>
            <h2 className="global-error-title">Something went wrong</h2>
            <p className="global-error-message">
              {error.message || "An unexpected error occurred."}
            </p>
            {error.digest ? (
              <p className="global-error-digest">
                Reference: <code>{error.digest}</code>
              </p>
            ) : null}

            <div className="global-error-actions">
              <button
                onClick={reset}
                className="global-error-btn global-error-btn-primary"
              >
                Try again
              </button>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/" className="global-error-btn global-error-btn-secondary">
                Go home
              </a>
            </div>
          </div>
        </div>

        <style>{`
          .global-error-page {
            position: fixed;
            inset: 0;
            display: grid;
            place-items: center;
            background: #0b0d11;
            color: #e8eaed;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            overflow: hidden;
          }
          .global-error-gradient {
            position: absolute;
            inset: 0;
            background:
              radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.15), transparent),
              radial-gradient(ellipse 50% 40% at 80% 100%, rgba(139, 92, 246, 0.1), transparent);
            pointer-events: none;
          }
          .global-error-content {
            position: relative;
            z-index: 1;
            text-align: center;
            padding: 2rem;
            max-width: 480px;
          }
          .global-error-code {
            font-size: 5rem;
            font-weight: 900;
            line-height: 1;
            margin: 0 0 0.5rem;
            background: linear-gradient(135deg, #60a5fa, #a78bfa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .global-error-title {
            font-size: 1.25rem;
            font-weight: 700;
            margin: 0 0 0.75rem;
            color: #f1f5f9;
          }
          .global-error-message {
            font-size: 0.875rem;
            color: #94a3b8;
            margin: 0 0 1rem;
            line-height: 1.5;
            word-break: break-word;
          }
          .global-error-digest {
            font-size: 0.75rem;
            color: #64748b;
            margin: 0 0 1.5rem;
          }
          .global-error-digest code {
            font-family: "SF Mono", "Fira Code", monospace;
            background: rgba(255,255,255,0.06);
            padding: 0.125rem 0.375rem;
            border-radius: 4px;
          }
          .global-error-actions {
            display: flex;
            gap: 0.75rem;
            justify-content: center;
            flex-wrap: wrap;
          }
          .global-error-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.625rem 1.25rem;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.15s ease;
            text-decoration: none;
            border: none;
          }
          .global-error-btn-primary {
            background: #2563eb;
            color: #fff;
          }
          .global-error-btn-primary:hover {
            background: #1d4ed8;
          }
          .global-error-btn-secondary {
            background: rgba(255,255,255,0.08);
            color: #e2e8f0;
            border: 1px solid rgba(255,255,255,0.1);
          }
          .global-error-btn-secondary:hover {
            background: rgba(255,255,255,0.12);
          }
        `}</style>
      </body>
    </html>
  );
}
