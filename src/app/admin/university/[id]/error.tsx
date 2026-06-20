"use client";

import { Button } from "@/components/ui/button";

export default function UniversityDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="block">
      <section className="overflow-x-hidden grid content-start gap-3.5 p-3.5">
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <span className="text-4xl" aria-hidden="true">⚠️</span>
          <h2 className="text-xl font-bold text-foreground">
            Failed to load university details
          </h2>
          <p className="text-sm text-muted-foreground">
            {error.message ?? "An unexpected error occurred."}
          </p>
          <Button onClick={reset} variant="default" className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white" >Try again</Button>
        </div>
      </section>
    </div>
  );
}
