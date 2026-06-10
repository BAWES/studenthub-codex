"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { applyToJob } from "@/app/candidate/jobs/actions";

type JobDetailData = {
  id: number;
  title: string;
  description: string;
  requirements?: string;
  location?: string;
  employmentType?: string;
  salaryRange?: string;
  employerName: string;
  createdAt: string;
};

type Props = {
  job: JobDetailData;
  hasApplied: boolean;
};

export function CandidateJobDetail({ job, hasApplied }: Props) {
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  const handleApply = async () => {
    setApplying(true);
    setMessage(null);

    const result = await applyToJob(job.id);

    if (result.success) {
      setMessage({ type: "success", text: "Application submitted successfully!" });
      router.refresh();
    } else {
      setMessage({ type: "error", text: result.error ?? "Failed to apply" });
    }

    setApplying(false);
  };

  return (
    <WorkspaceShell
      session={{} as never}
      eyebrow="Candidate"
      title={job.title}
      showSidebar={false}
    >
      <div className="mx-auto max-w-3xl space-y-8 py-8">
        {/* Employer & Meta Info */}
        <div className="space-y-2">
          <p className="text-sm text-gray-500">{job.employerName}</p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            {job.employmentType && <span>{job.employmentType}</span>}
            {job.location && <span>{job.location}</span>}
            {job.salaryRange && <span>{job.salaryRange}</span>}
            <span>Posted {job.createdAt}</span>
          </div>
        </div>

        {/* Description */}
        <section>
          <h2 className="mb-3 text-lg font-semibold">Description</h2>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
            {job.description}
          </div>
        </section>

        {/* Requirements */}
        {job.requirements && (
          <section>
            <h2 className="mb-3 text-lg font-semibold">Requirements</h2>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
              {job.requirements}
            </div>
          </section>
        )}

        {/* Apply Button */}
        <div className="border-t pt-6">
          {hasApplied ? (
            <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
              You have already applied to this position.
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={handleApply}
                disabled={applying}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
              >
                {applying ? "Applying..." : "Apply Now"}
              </button>

              {message && (
                <div
                  className={`rounded-lg px-4 py-3 text-sm ${
                    message.type === "success"
                      ? "bg-green-50 text-green-800"
                      : "bg-red-50 text-red-800"
                  }`}
                >
                  {message.text}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Back link */}
        <div>
          <button
            onClick={() => router.push("/candidate/jobs")}
            className="text-sm text-blue-600 hover:underline"
          >
            &larr; Back to Jobs
          </button>
        </div>
      </div>
    </WorkspaceShell>
  );
}
