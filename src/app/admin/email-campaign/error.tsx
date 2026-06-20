"use client";

import { Button } from "@/components/ui/button";

export default function AdminEmailCampaignsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
      <h2 className="text-lg font-semibold text-foreground">
        Something went wrong loading email campaigns
      </h2>
      <p className="text-sm text-muted-foreground">
        {error.message ?? "An unexpected error occurred."}
      </p>
      <Button onClick={reset} variant="default" className="h-9 rounded-lg px-4 text-sm font-semibold bg-primary text-white" type="button">Try again</Button>
    </div>
  );
}
