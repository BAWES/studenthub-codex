"use client";

export default function TagDetailError({
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
            Something went wrong
          </h2>
          <p className="text-sm max-w-md text-center" style={{ color: "var(--muted)" }}>
            {error.message ?? "An unexpected error occurred while loading the tag details."}
          </p>
          <button
            onClick={reset}
            className="mt-2 h-10 rounded-lg px-4 text-sm font-semibold"
            style={{ background: "var(--sh-info)", color: "#fff" }}
          >
            Try again
          </button>
        </div>
      </section>
    </div>
  );
}
