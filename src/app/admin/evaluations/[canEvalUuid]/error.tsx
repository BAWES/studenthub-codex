"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-muted-foreground"
    >
      <p className="text-sm font-medium text-foreground">
        Something went wrong loading this evaluation.
      </p>
      <p className="text-xs max-w-md text-center">
        {error.message}
      </p>
      <button
        type="button"
        onClick={reset}
        className="h-8 rounded-lg px-4 text-xs font-semibold bg-primary text-white"
      >
        Try again
      </button>
    </div>
  );
}
