"use client";

import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminNotesError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[admin/note]", error);
  }, [error]);

  return (
    <div className="block">
      <section className="overflow-x-hidden grid content-start gap-3.5 p-3.5">
        <section className="sticky top-2.5 z-20 flex items-center justify-between gap-3 min-h-14 px-4 mb-1 rounded-lg bg-card border border-border">
          <h1 className="text-lg font-semibold" style={{ color: "var(--sh-error)" }}>
            Something went wrong
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            {error.message || "Failed to load notes."}
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 rounded-lg px-4 py-2 text-sm font-semibold"
            style={{ background: "var(--sh-primary)", color: "#fff" }}
          >
            Try again
          </button>
        </section>
      </section>
    </div>
  );
}
