"use client";

import { Button } from "@/components/ui/button";

export default function TransferDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="block">
      <section className="overflow-x-hidden grid content-start gap-3.5 p-3.5">
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <span className="text-4xl" aria-hidden="true">⚠️</span>
          <h2 className="text-xl font-bold text-foreground">
            Something went wrong
          </h2>
          <p className="text-sm max-w-md text-center text-muted-foreground">
            {error.message ?? "An unexpected error occurred while loading the transfer details."}
          </p>
          <Button onClick={reset} variant="default" className="mt-2" >Try again</Button>
        </div>
      </section>
    </div>
  );
}
