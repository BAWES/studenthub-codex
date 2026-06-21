"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-svh">
      <section className="min-w-0 overflow-x-hidden grid content-start gap-3.5 p-3.5">
        <section className="grid grid-cols-[1fr_minmax(220px,300px)] items-center gap-4.5 border border-border rounded-lg bg-card p-4">
          <div>
            <p className="text-blue-600 text-xs font-bold uppercase tracking-normal mb-2.5">Candidate</p>
            <h1 className="text-[clamp(27px,2.8vw,42px)] leading-[1.05] tracking-normal mb-0">Messages</h1>
          </div>
        </section>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <span className="text-4xl" aria-hidden="true">⚠️</span>
          <h2 className="text-xl font-bold text-foreground">
            Something went wrong
          </h2>
          <p className="text-sm max-w-md text-center text-muted-foreground">
            {error.message ?? "An unexpected error occurred while loading the Chat page."}
          </p>
          {error.digest ? (
            <small className="text-muted-foreground/70">Error ID: {error.digest}</small>
          ) : null}
          <Button
            type="button"
            onClick={reset}
            variant="default"
            className="mt-2"
          >
            Try again
          </Button>
        </div>
      </section>
    </div>
  );
}
