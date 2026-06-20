"use client";

export default function AdminEventError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <p className="text-sm text-destructive">
        {error.message || "Failed to load events"}
      </p>
      <button
        type="button"
        onClick={reset}
        className="text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground"
      >
        Try again
      </button>
    </div>
  );
}
