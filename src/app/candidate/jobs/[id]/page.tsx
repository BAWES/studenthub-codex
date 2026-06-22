import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { getCandidateJob } from "../actions";
import { ApplyButton } from "./ApplyButton";
import { MatchScoreBadge } from "@/components/matching";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

function formatField(label: string, value: string | null | undefined): string {
  return value ? `${label}: ${value}` : "";
}

/** Format score breakdown for display — show sub-scores inline. */
function breakdownLabel(key: string, score: number | null): string {
  if (score === null) return `${key}: —`;
  return `${key}: ${score}%`;
}

export default async function CandidateJobDetailPage({ params }: Props) {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const { id } = await params;

  let result;
  try {
    result = await getCandidateJob({ jobId: Number(id) });
  } catch {
    notFound();
  }

  const { job } = result;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Link href="/candidate/jobs" className="text-sm text-blue-400 hover:text-blue-300 mb-4 inline-block">
        &larr; Back to Jobs
      </Link>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6">
        {/* Header with match score */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <p className="text-muted-foreground text-sm mt-1">{job.employerName}</p>
          </div>

          {/* Match score badge */}
          {job.matchScore !== null && (
            <div className="shrink-0">
              <MatchScoreBadge score={job.matchScore} label="Match" />
            </div>
          )}
        </div>

        {/* Score breakdown */}
        {job.matchScore !== null && (
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 font-medium">
              {breakdownLabel("Skills", job.skillScore)}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 font-medium">
              {breakdownLabel("Education", job.educationScore)}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/10 text-amber-400 font-medium">
              {breakdownLabel("Location", job.locationScore)}
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          {job.employmentType && (
            <div>
              <span className="text-muted-foreground">Type</span>
              <p className="font-medium">{job.employmentType}</p>
            </div>
          )}
          {job.location && (
            <div>
              <span className="text-muted-foreground">Location</span>
              <p className="font-medium">{job.location}</p>
            </div>
          )}
          {job.salaryRange && (
            <div>
              <span className="text-muted-foreground">Salary Range</span>
              <p className="font-medium">{job.salaryRange}</p>
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Posted</span>
            <p className="font-medium">{job.createdAt.toISOString().slice(0, 10)}</p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Description</h2>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{job.description}</p>
        </div>

        {job.requirements && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Requirements</h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{job.requirements}</p>
          </div>
        )}

        <div className="pt-4 border-t border-white/10">
          {job.hasApplied ? (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-600/20 text-green-400 rounded-lg text-sm font-medium">
              Applied &mdash; {job.applicationStatus}
            </div>
          ) : (
            <ApplyButton jobListingId={job.jobListingId} />
          )}
        </div>
      </div>
    </div>
  );
}
