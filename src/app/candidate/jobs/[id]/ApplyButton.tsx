"use client";

import { useCallback, useState } from "react";
import { applyToJob } from "../actions";

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
      <button
        onClick={handleApply}
        disabled={applying}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {applying ? "Applying..." : "Apply Now"}
      </button>
      {result && (
        <p className={`mt-2 text-sm ${result.success ? "text-green-500" : "text-red-500"}`}>
          {result.message}
        </p>
      )}
    </div>
  );
}
