import { requireRoleCapability } from "@/modules/auth/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Route } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

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

export default async function EmployerJobApplicationsPage({ params }: Props) {
  const { id } = await params;
  const session = await requireRoleCapability("company", "company.write.linked");

  // Get the job to verify ownership
  const job = await prisma.job_listing.findUnique({
    where: { jobListingId: Number(id) },
    select: { jobListingId: true, title: true },
  });

  if (!job) {
    return (
      <main className="container mx-auto py-8 max-w-4xl text-center">
        <h1 className="text-2xl font-bold">Job Not Found</h1>
        <p className="text-muted-foreground mt-2">This job listing does not exist.</p>
      </main>
    );
  }

  // Fetch applications for this job
  const applications = await prisma.job_listing_application.findMany({
    where: { jobListingId: Number(id) },
    include: {
      candidate: {
        select: {
          candidate_id: true,
          full_name: true,
          email_address: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="container mx-auto py-8 max-w-4xl">
      <div className="mb-6">
        <Link
          href={`/employer/jobs/${id}` as Route}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
        >
          ← Back to job
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Applications</h1>
        <p className="text-muted-foreground mt-1">
          {job.title} — {applications.length} application{applications.length !== 1 ? "s" : ""}
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-16 border rounded-xl">
          <div className="text-4xl mb-4">📋</div>
          <h2 className="text-xl font-semibold mb-2">No applications yet</h2>
          <p className="text-muted-foreground">
            Candidates haven&apos;t applied to this job yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <div
              key={app.applicationId}
              className="border rounded-xl p-5 hover:border-primary/20 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-lg font-semibold truncate">
                      {app.candidate.full_name ?? `Candidate #${app.candidateId}`}
                    </h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                        statusColors[app.status] ?? "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {statusLabels[app.status] ?? app.status}
                    </span>
                  </div>
                  {app.candidate.email_address && (
                    <p className="text-sm text-muted-foreground">
                      {app.candidate.email_address}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Applied {new Date(app.createdAt).toLocaleDateString("en-KW", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
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
