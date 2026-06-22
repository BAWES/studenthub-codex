"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-xl font-semibold">Something went wrong!</h2>
      <p className="text-muted-foreground text-sm">
        {error.message ?? "An unexpected error occurred while loading jobs."}
      </p>
      <button
        onClick={() => reset()}
        className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground"
      >
        Try again
      </button>
    </div>
  );
}
