"use client";

import { Button } from "@/components/ui/button";

export default function AdminErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="errorPage">
      <h1>Admin system error</h1>
      <p>{error.message || "An unexpected error occurred in the admin workspace."}</p>
      {error.digest ? <small>Error ID: {error.digest}</small> : null}
      <Button onClick={reset} variant="secondary">
        Try again
      </Button>
    </div>
  );
}
