"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <span className="text-4xl" aria-hidden="true">⚠️</span>
      <h2 className="text-xl font-bold text-[var(--ink)]">
        Something went wrong
      </h2>
      <p className="text-sm max-w-md text-center text-[var(--muted)]">
        {error.message ?? "An unexpected error occurred while loading the page."}
      </p>
      {error.digest ? <small className="text-[var(--muted)]">Error ID: {error.digest}</small> : null}
      <button
        onClick={reset}
        className="mt-2 h-10 rounded-lg bg-[#eb6651] px-4 text-sm font-semibold text-white hover:bg-[#d45441]"
      >
        Try again
      </button>
    </div>
  );
}
