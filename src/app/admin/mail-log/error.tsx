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
      <h2 className="text-lg font-semibold text-destructive">
        Failed to load mail log
      </h2>
      <p className="text-sm text-muted-foreground">
        {error.message ?? "An unexpected error occurred."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg px-4 py-2 text-sm font-semibold bg-primary text-white"
      >
        Try again
      </button>
    </div>
  );
}
