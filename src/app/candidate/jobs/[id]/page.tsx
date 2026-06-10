import { requireRoleCapability } from "@/modules/auth/session";
import { getCandidateJob } from "../actions";
import { checkIfApplied } from "./actions";
import { ApplyButton, BackButton } from "./ApplyButton";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CandidateJobDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const job = await getCandidateJob({ jobId: Number(id) });

  if (!job) {
    return (
      <main className="container mx-auto py-8 max-w-3xl text-center">
        <div className="text-4xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold">Job Not Found</h1>
        <p className="text-muted-foreground mt-2">
          This job posting may have been removed or is no longer accepting applications.
        </p>
        <BackButton />
      </main>
    );
  }

  const alreadyApplied = await checkIfApplied(job.jobListingId);

  return (
    <main className="container mx-auto py-8 max-w-3xl">
      <BackButton />

      <div className="mt-4">
        {/* Header */}
        <div className="border-b pb-6 mb-6">
          <h1 className="text-3xl font-bold">{job.title}</h1>
          <div className="flex flex-wrap gap-2 mt-3 text-sm text-muted-foreground">
            {job.employerName && (
              <span className="inline-flex items-center gap-1">🏢 {job.employerName}</span>
            )}
            {job.location && (
              <span className="inline-flex items-center gap-1">📍 {job.location}</span>
            )}
            {job.employmentType && (
              <span className="inline-flex items-center gap-1">💼 {job.employmentType}</span>
            )}
            {job.salaryRange && (
              <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                💰 {job.salaryRange}
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Posted {new Date(job.createdAt).toLocaleDateString("en-KW", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Description */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Description</h2>
          <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
            {job.description}
          </div>
        </section>

        {/* Requirements */}
        {job.requirements && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Requirements</h2>
            <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
              {job.requirements}
            </div>
          </section>
        )}

        {/* Apply section */}
        <div className="border-t pt-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {alreadyApplied
                ? "You have already applied to this position."
                : "Ready to apply? Submit your application."}
            </p>
          </div>
          <ApplyButton jobId={job.jobListingId} alreadyApplied={alreadyApplied} />
        </div>
      </div>
    </main>
  );
}
