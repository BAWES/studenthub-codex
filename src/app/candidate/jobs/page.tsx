import { requireRoleCapability } from "@/modules/auth/session";
import { listCandidateJobs } from "./actions";
import Link from "next/link";
import type { Route } from "next";

export const dynamic = "force-dynamic";

export default async function CandidateJobsPage() {
  await requireRoleCapability("candidate", "candidate.read.own");
  const result = await listCandidateJobs({ limit: 50 });

  const typeOptions = ["", "full-time", "part-time", "internship", "contract"];
  const typeLabels: Record<string, string> = {
    "": "All types",
    "full-time": "Full-time",
    "part-time": "Part-time",
    "internship": "Internship",
    "contract": "Contract",
  };

  return (
    <main className="container mx-auto py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Job Openings</h1>
          <p className="text-muted-foreground mt-1">
            Browse job opportunities from employers. {result.total} open position{result.total !== 1 ? "s" : ""} available.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/candidate/applications"
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            My Applications
          </Link>
        </div>
      </div>

      {/* Quick filter by type */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {typeOptions.map((t) => (
          <Link
            key={t}
            href={t ? `/candidate/jobs?employmentType=${t}` as Route : "/candidate/jobs" as Route}
            className="px-3 py-1.5 rounded-full text-sm border border-border hover:bg-secondary/50 transition-colors"
          >
            {typeLabels[t]}
          </Link>
        ))}
      </div>

      {result.items.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">📋</div>
          <h2 className="text-xl font-semibold mb-2">No open positions right now</h2>
          <p className="text-muted-foreground">
            Check back later for new job opportunities.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {result.items.map((job) => (
            <Link
              key={job.jobListingId}
              href={`/candidate/jobs/${job.jobListingId}` as Route}
              className="block border rounded-xl p-5 hover:border-primary/30 hover:bg-secondary/20 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold truncate">{job.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {job.employerName}
                    {job.location ? ` · ${job.location}` : ""}
                    {job.employmentType ? ` · ${job.employmentType}` : ""}
                  </p>
                  <p className="text-sm mt-2 line-clamp-2">{job.description}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {job.salaryRange ? (
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      {job.salaryRange}
                    </span>
                  ) : null}
                  <span className="text-xs text-muted-foreground">
                    {new Date(job.createdAt).toLocaleDateString("en-KW", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
