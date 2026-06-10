import { requireRoleCapability } from "@/modules/auth/session";
import { listMyApplications } from "../jobs/actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  new: "New",
  applied: "Applied",
  reviewing: "Under Review",
  interview: "Interview",
  rejected: "Not Selected",
  accepted: "Accepted",
};

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  applied: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  reviewing: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  interview: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  accepted: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
};

export default async function CandidateApplicationsPage() {
  await requireRoleCapability("candidate", "candidate.read.own");
  const result = await listMyApplications({ limit: 50 });

  return (
    <main className="container mx-auto py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Applications</h1>
          <p className="text-muted-foreground mt-1">
            Track the status of your job applications.
            {result.total > 0 ? ` ${result.total} total.` : ""}
          </p>
        </div>
        <Link
          href="/candidate/jobs"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Browse Jobs
        </Link>
      </div>

      {result.items.length === 0 ? (
        <div className="text-center py-16 border rounded-xl">
          <div className="text-4xl mb-4">📝</div>
          <h2 className="text-xl font-semibold mb-2">No applications yet</h2>
          <p className="text-muted-foreground mb-6">
            Start by browsing available job openings and applying.
          </p>
          <Link
            href="/candidate/jobs"
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors inline-block"
          >
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {result.items.map((app) => (
            <div
              key={app.id}
              className="border rounded-xl p-5 hover:border-primary/20 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-lg font-semibold truncate">{app.jobTitle}</h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                        statusColors[app.status] ?? "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {statusLabels[app.status] ?? app.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {app.employerName}
                    {app.location ? ` · ${app.location}` : ""}
                    {app.employmentType ? ` · ${app.employmentType}` : ""}
                    {app.salaryRange ? ` · ${app.salaryRange}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Applied {new Date(app.appliedAt).toLocaleDateString("en-KW", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  {app.coverLetter && (
                    <details className="mt-2">
                      <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                        Cover letter
                      </summary>
                      <p className="text-sm mt-2 whitespace-pre-wrap text-muted-foreground bg-secondary/30 rounded-lg p-3">
                        {app.coverLetter}
                      </p>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
