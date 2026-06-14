"use client";

// ---------------------------------------------------------------------------
// Admin Designations [id] — error boundary
// ---------------------------------------------------------------------------

export default function DesignationDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="errorPage">
      <h1>Failed to load designation details</h1>
      <p className="text-muted-foreground">
        {error.message ?? "An unexpected error occurred."}
      </p>
      <button
        type="button"
        className="uiButton uiButtonGhost"
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  );
}
