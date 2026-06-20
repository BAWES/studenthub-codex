"use client";

import { Button } from "@/components/ui/button";

export default function StaffErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="errorPage">
      <h1>Staff system error</h1>
      <p>{error.message || "An unexpected error occurred in the staff workspace."}</p>
      {error.digest ? <small>Error ID: {error.digest}</small> : null}
      <Button onClick={reset} variant="secondary">
        Try again
      </Button>
    </div>
  );
}
