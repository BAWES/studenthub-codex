"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="shell shellEmbedded">
      <section className="workspaceStage">
        <section className="topbar">
          <div>
            <p className="eyebrow">Candidate</p>
            <h1>Messages</h1>
          </div>
        </section>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <span className="text-4xl" aria-hidden="true">⚠️</span>
          <h2 className="text-xl font-bold text-[#1d1c1a]">
            Something went wrong
          </h2>
          <p className="text-sm max-w-md text-center text-[#6e6b66]">
            {error.message ?? "An unexpected error occurred while loading the Chat page."}
          </p>
          {error.digest ? (
            <small className="text-[#a09d98]">Error ID: {error.digest}</small>
          ) : null}
          <button
            type="button"
            onClick={reset}
            className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-coral px-4 py-2 text-sm font-semibold text-white hover:bg-[#d45441] transition-colors"
          >
            Try again
          </button>
        </div>
      </section>
    </div>
  );
}
