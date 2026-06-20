"use client";

export default function AdminMailLogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 p-8">
      <h2 className="text-lg font-semibold" style={{ color: "var(--sh-error)" }}>
        Failed to load mail log
      </h2>
      <p className="text-sm" style={{ color: "var(--muted)" }}>
        {error.message ?? "An unexpected error occurred."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
        style={{ background: "var(--sh-primary)" }}
      >
        Try again
      </button>
    </div>
  );
}
