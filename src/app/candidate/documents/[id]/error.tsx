"use client";

export default function CandidateDocumentDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-0">
      <section className="min-w-0 overflow-x-hidden grid content-start gap-3.5 p-3.5">
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <span className="text-4xl" aria-hidden="true">⚠️</span>
          <h2 className="text-xl font-bold text-foreground">
            Something went wrong
          </h2>
          <p className="text-sm max-w-md text-center text-muted-foreground">
            {error.message ?? "An unexpected error occurred while loading the document details."}
          </p>
          <button
            onClick={reset}
            className="mt-2 h-10 rounded-lg px-4 text-sm font-semibold bg-primary text-primary-foreground"
          >
            Try again
          </button>
        </div>
      </section>
    </div>
  );
}
