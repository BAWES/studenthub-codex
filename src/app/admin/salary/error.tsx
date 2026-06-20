"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <p className="text-sm font-medium" style={{ color: "var(--sh-error)" }}>
        Something went wrong loading salary records.
      </p>
      <p className="text-xs" style={{ color: "var(--muted)" }}>
        {error.message}
      </p>
      <button
        type="button"
        onClick={reset}
        className="px-4 py-2 text-sm rounded-lg font-medium"
        style={{ background: "var(--sh-primary)", color: "#fff" }}
      >
        Try again
      </button>
    </div>
  );
}
