"use client";

export default function AdminCountryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
      <h2 className="text-lg font-semibold" style={{ color: "var(--ink)" }}>
        Something went wrong loading countries
      </h2>
      <p className="text-sm" style={{ color: "var(--muted)" }}>
        {error.message ?? "An unexpected error occurred."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="h-9 rounded-lg px-4 text-sm font-semibold"
        style={{ background: "var(--sh-primary)", color: "#fff" }}
      >
        Try again
      </button>
    </div>
  );
}
