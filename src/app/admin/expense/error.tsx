"use client";

export default function AdminExpenseError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
      <h2 className="text-lg font-semibold text-destructive">Something went wrong</h2>
      <p className="text-sm text-muted-foreground max-w-md text-center">
        {error.message || "Failed to load expense records."}
      </p>
      <button
        onClick={reset}
        className="text-sm font-medium text-blue-zendesk hover:underline"
      >
        Try again
      </button>
    </div>
  );
}
