"use client";

export default function UniversityDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="block">
      <section className="overflow-x-hidden grid content-start gap-3.5 p-3.5">
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <span className="text-4xl" aria-hidden="true">⚠️</span>
          <h2 className="text-xl font-bold" style={{ color: "var(--ink)" }}>
            Failed to load university details
          </h2>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {error.message ?? "An unexpected error occurred."}
          </p>
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: "var(--sh-primary)", color: "#fff" }}
          >
            Try again
          </button>
        </div>
      </section>
    </div>
  );
}
