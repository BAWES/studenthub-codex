// ---------------------------------------------------------------------------
// MatchingResultsSection — show top-matched jobs for the candidate
// ---------------------------------------------------------------------------

"use client";

import Link from "next/link";
import MatchScoreBadge from "./MatchScoreBadge";

export type MatchedJob = {
  jobListingId: number;
  title: string;
  employerName: string;
  location: string | null;
  employmentType: string | null;
  salaryRange: string | null;
  score: number | null;
};

type Props = {
  jobs: MatchedJob[];
};

export default function MatchingResultsSection({ jobs }: Props) {
  if (jobs.length === 0) return null;

  return (
    <section
      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4"
      data-testid="matching-results-section"
    >
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Best matches for you</h2>
        <p className="text-sm text-muted-foreground">
          Jobs ranked by how well they match your skills, education, and
          location
        </p>
      </div>

      {/* Job list */}
      <div className="space-y-3">
        {jobs.map((job) => (
          <Link
            key={job.jobListingId}
            href={`/candidate/jobs/${job.jobListingId}`}
            className="block rounded-lg border border-[var(--border)] p-4 transition-colors hover:bg-accent/50"
            data-testid="matched-job-card"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Job info */}
              <div className="min-w-0 flex-1">
                <h3 className="font-medium truncate">{job.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {job.employerName}
                </p>
                <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-muted-foreground">
                  {job.employmentType && (
                    <span className="capitalize">{job.employmentType}</span>
                  )}
                  {job.location && <span>{job.location}</span>}
                  {job.salaryRange && (
                    <span className="font-medium">{job.salaryRange}</span>
                  )}
                </div>
              </div>

              {/* Match score badge */}
              <div className="shrink-0">
                <MatchScoreBadge score={job.score} label="Match" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
