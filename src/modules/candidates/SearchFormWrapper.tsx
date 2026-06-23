"use client";

import { useRef, useState, type FormEvent } from "react";

/**
 * SearchFormWrapper — wraps the candidate search form to show a loading
 * indicator and slow-search warning while the page is navigating.
 *
 * The form uses GET navigation (full page reload), so we detect submission
 * via onSubmit and show an overlay until the browser navigates away.
 *
 * Slow search warning appears after 3 seconds with Zendesk coral styling.
 */
export function SearchFormWrapper({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    // Only react if there's a search query
    const form = e.currentTarget;
    const query = (form.querySelector<HTMLInputElement>('[name="q"]')?.value ?? "").trim();
    if (!query) return;

    setLoading(true);
    setElapsed(0);

    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  };

  const handleReset = () => {
    setLoading(false);
    setElapsed(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  // Clean up timer on unmount
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      id="candidate-search"
      className="relative"
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      {children}

      {loading && (
        <div
          className="fixed top-0 left-0 right-0 z-[9999] h-[3px] overflow-hidden pointer-events-none bg-coral/10"
        >
          <div
            className="h-full bg-coral animate-[search-progress_30s_linear_forwards]"
          />
          {elapsed >= 3 && (
            <div
              className="fixed top-[4px] right-3 text-[11px] font-bold pointer-events-none bg-card text-coral rounded-b-lg p-[4px_10px] border border-coral/30 border-t-0"
            >
              Still searching… {elapsed}s
            </div>
          )}
        </div>
      )}
    </form>
  );
}
