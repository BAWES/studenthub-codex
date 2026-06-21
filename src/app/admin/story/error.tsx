"use client";

import { useEffect } from "react";

export default function AdminStoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin/story] Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 p-8">
      <h2 className="text-xl font-semibold text-destructive">
        Something went wrong
      </h2>
      <p className="text-muted-foreground text-sm max-w-md text-center">
        An error occurred while loading the story management page. Please try
        again.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
