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
        className="bg-[#eb6651] hover:bg-[#d45441] text-white"
      >
        {applying ? "Applying..." : "Apply Now"}
      </Button>
      {result && (
        <p className={`mt-2 text-sm ${result.success ? "text-[#2e7d32]" : "text-[#d32f2f]"}`}>
          {result.message}
        </p>
      )}
    </div>
  );
}
