import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { getCandidateJob } from "../actions";
import { ApplyButton } from "./ApplyButton";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

function formatField(label: string, value: string | null | undefined): string {
  return value ? `${label}: ${value}` : "";
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
        <div>
          <h1 className="text-2xl font-bold">{job.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">{job.employerName}</p>
        </div>

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
