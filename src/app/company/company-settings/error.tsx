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
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <span className="text-4xl" aria-hidden="true">⚠️</span>
      <h2 className="text-xl font-bold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground max-w-md text-center">
        {error.message ?? "An unexpected error occurred while loading the company settings page."}
      </p>
      <Button onClick={reset} variant="secondary" className="mt-2">
        Try again
      </Button>
    </div>
  );
}
