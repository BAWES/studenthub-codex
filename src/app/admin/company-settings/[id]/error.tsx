"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
        <p className="text-sm mb-4">Failed to load company settings.</p>
        <button
          onClick={() => reset()}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-primary text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
