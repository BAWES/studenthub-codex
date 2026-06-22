import Link from "next/link";
import { requireRoleCapability } from "@/modules/auth/session";
import { listCandidateJobs } from "./actions";
import { CandidateJobsTable } from "./_components";
import { MatchingResultsSection } from "@/components/matching";

export const dynamic = "force-dynamic";

export default async function CandidateJobsPage() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const result = await listCandidateJobs({ limit: 50 });

  const rows = result.jobs.map((job) => ({
    id: job.jobListingId,
    title: job.title,
    employerName: job.employerName,
    employmentType: job.employmentType ?? "—",
    location: job.location ?? "—",
    salaryRange: job.salaryRange ?? "—",
    createdAt: job.createdAt.toISOString().slice(0, 10),
    matchScore: job.matchScore,
  }));

  // Top 5 matching jobs for the highlights section
  const topMatches = result.jobs
    .filter((j) => j.matchScore !== null)
    .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0))
    .slice(0, 5)
    .map((j) => ({
      jobListingId: j.jobListingId,
      title: j.title,
      employerName: j.employerName,
      location: j.location,
      employmentType: j.employmentType,
      salaryRange: j.salaryRange,
      score: j.matchScore,
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Job Opportunities</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Browse and apply to posted job listings
          </p>
        </div>
      </div>

      <MatchingResultsSection jobs={topMatches} />

      <CandidateJobsTable session={session} rows={rows} total={result.total} />
    </div>
  );
}
