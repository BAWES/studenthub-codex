"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8" role="alert">
      <span className="text-5xl" aria-hidden="true">⚠️</span>
      <div className="text-center max-w-md">
        <h2 className="text-xl font-bold mb-2 text-foreground">Something went wrong</h2>
        <p className="text-sm mb-4 text-muted-foreground">
          {error.message ?? "An unexpected error occurred while loading the payments page."}
        </p>
      </div>
      <button onClick={reset} className="h-10 rounded-lg px-5 text-sm font-semibold bg-[var(--sh-info)] text-white">
        Try again
      </button>
    </div>
  );
}
