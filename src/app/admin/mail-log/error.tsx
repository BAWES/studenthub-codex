"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminMailLogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center min-h-[40vh] justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-destructive">Failed to load mail log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {error.message ?? "An unexpected error occurred."}
          </p>
          <Button onClick={reset} variant="secondary">
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
