"use client";

import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Admin Invoices [id] — error boundary
// ---------------------------------------------------------------------------

export default function InvoiceDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="grid place-items-center gap-4 p-12 text-center">
      <h1 className="text-lg font-semibold text-foreground">Failed to load invoice details</h1>
      <p className="text-sm text-muted-foreground max-w-md">
        {error.message ?? "An unexpected error occurred."}
      </p>
      <Button type="button" variant="outline" size="sm" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
