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
      <p className="text-sm font-medium text-destructive">
        Something went wrong loading salary records.
      </p>
      <p className="text-xs text-muted-foreground">
        {error.message}
      </p>
      <button
        type="button"
        onClick={reset}
        className="h-9 rounded-lg px-4 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  );
}
