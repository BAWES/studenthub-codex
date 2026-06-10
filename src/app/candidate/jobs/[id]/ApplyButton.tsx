"use client";

import { useRouter } from "next/navigation";
import { applyToJob } from "../actions";
import { useState } from "react";

export function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("/candidate/jobs")}
      className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
    >
      ← Back to job listings
    </button>
  );
}

export function ApplyButton({
  jobId,
  alreadyApplied,
}: {
  jobId: number;
  alreadyApplied: boolean;
}) {
  const router = useRouter();
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState<"idle" | "applied" | "error">(
    alreadyApplied ? "applied" : "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");

  const handleApply = async () => {
    if (result === "applied") return;
    setApplying(true);
    setErrorMsg("");

    try {
      const res = await applyToJob({ jobId });
      if (res.alreadyApplied) {
        setResult("applied");
      } else {
        setResult("applied");
        router.refresh();
      }
    } catch (e) {
      setResult("error");
      setErrorMsg(e instanceof Error ? e.message : "Failed to apply");
    } finally {
      setApplying(false);
    }
  };

  if (result === "applied") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-green-600 dark:text-green-400 font-medium">
          ✓ Application submitted
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleApply}
        disabled={applying}
        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {applying ? "Applying..." : "Apply Now"}
      </button>
      {errorMsg && (
        <p className="text-xs text-red-500">{errorMsg}</p>
      )}
    </div>
  );
}
