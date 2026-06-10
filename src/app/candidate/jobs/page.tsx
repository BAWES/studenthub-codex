import Link from "next/link";
import { requireRoleCapability } from "@/modules/auth/session";
import { listCandidateJobs } from "./actions";
import { CandidateJobsTable } from "./candidate-jobs-table";

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

      <CandidateJobsTable session={session} rows={rows} total={result.total} />
    </div>
  );
}
