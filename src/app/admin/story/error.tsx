"use client";

import { Button } from "@/components/ui/button";

export default function AdminStoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
      <h2 className="text-lg font-semibold text-foreground">
        Something went wrong loading stories
      </h2>
      <p className="text-sm text-muted-foreground">
        {error.message ?? "An unexpected error occurred."}
      </p>
      <Button onClick={reset} variant="default" className="mt-2">Try again</Button>
    </div>
  );
}
