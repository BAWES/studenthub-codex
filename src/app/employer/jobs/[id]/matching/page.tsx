import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { getJob } from "../../actions";
import { getMatchingCandidates } from "./actions";
import { MatchingCandidatesTable } from "./matching-candidates-table";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EmployerMatchingCandidatesPage({ params }: Props) {
  const session = await requireRoleCapability("company", "company.read.linked");
  const { id } = await params;

  const job = await getJob({ jobId: Number(id) });
  if (!job) notFound();

  const result = await getMatchingCandidates({ jobId: Number(id), limit: 50 });

  return (
    <div className="py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Matching Candidates</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Candidates matched to &ldquo;{job.title}&rdquo;
          </p>
        </div>
        <Link
          href={`/employer/jobs/${job.jobListingId}/applications`}
          className="inline-flex items-center gap-2 px-4 py-2 border border-white/20 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
        >
          View Applications
        </Link>
      </div>

      <MatchingCandidatesTable
        candidates={result.candidates}
        total={result.total}
        jobTitle={job.title}
      />
    </div>
  );
}
