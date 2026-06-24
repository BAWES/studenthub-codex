"use client";

import { useCallback, useState } from "react";
import { applyToJob } from "../actions";
import { Button } from "@/components/ui/button";

type Props = {
  jobListingId: number;
};

export function ApplyButton({ jobListingId }: Props) {
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleApply = useCallback(async () => {
    setApplying(true);
    setResult(null);
    try {
      const res = await applyToJob({ jobListingId });
      setResult({ success: true, message: res.message });
    } catch (e) {
      setResult({ success: false, message: e instanceof Error ? e.message : "Failed to apply" });
    } finally {
      setApplying(false);
    }
  }, [jobListingId]);

  return (
    <div>
      <Button
        onClick={handleApply}
        disabled={applying}
        className="bg-coral hover:bg-coral/90 text-white"
      >
        {applying ? "Applying..." : "Apply Now"}
      </Button>
      {result && (
        <p className={`mt-2 text-sm ${result.success ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
          {result.message}
        </p>
      )}
    </div>
  );
}
