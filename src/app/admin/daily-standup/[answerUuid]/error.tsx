"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
      <h2 className="text-lg font-semibold" style={{ color: "var(--sh-error)" }}>
        Something went wrong
      </h2>
      <p className="text-sm" style={{ color: "var(--muted)" }}>
        {error.message ?? "Failed to load standup answer details."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg px-4 py-2 text-sm font-semibold"
        style={{ background: "var(--sh-primary)", color: "#fff" }}
      >
        Try again
      </button>
    </div>
  );
}
