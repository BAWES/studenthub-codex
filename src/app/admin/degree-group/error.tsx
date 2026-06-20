"use client";

export default function AdminDegreeGroupError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
      <h2 className="text-lg font-semibold" style={{ color: "var(--sh-error)" }}>
        Something went wrong
      </h2>
      <p className="text-sm" style={{ color: "var(--muted)" }}>
        {error.message ?? "Failed to load degree groups."}
      </p>
      <button
        onClick={reset}
        className="h-9 rounded-lg px-4 text-sm font-semibold"
        style={{ background: "var(--sh-primary)", color: "#fff" }}
      >
        Try again
      </button>
    </div>
  );
}
