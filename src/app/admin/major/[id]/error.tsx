import { Button } from "@/components/ui/button";
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h2 className="text-lg font-semibold text-destructive">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">Failed to load major details.</p>
      <Button onClick={reset} size="sm">
          Try again
        </Button>
    </div>
  );
}
