"use client";

export default function AdminStoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="block">
      <section className="overflow-x-hidden grid content-start gap-3.5 p-3.5">
        <section className="sticky top-2.5 z-20 flex items-center justify-between gap-3 min-h-14 px-4 mb-1 rounded-lg bg-card border border-border">
          <div>
            <div className="h-3 w-24 mb-2 rounded bg-white/5 animate-pulse" />
            <div className="h-7 w-48 rounded bg-white/5 animate-pulse" />
          </div>
        </section>
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <p className="text-sm" style={{ color: "var(--sh-error)" }}>
            Something went wrong loading stories.
          </p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            {error.message}
          </p>
          <button
            onClick={reset}
            className="rounded-lg px-4 py-2 text-sm font-semibold"
            style={{ background: "var(--sh-primary)", color: "#fff" }}
          >
            Try again
          </button>
        </div>
      </section>
    </div>
  );
}
