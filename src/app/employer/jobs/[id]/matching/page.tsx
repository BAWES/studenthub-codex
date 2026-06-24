import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { getJob } from "../../actions";
import { getMatchingCandidates } from "./actions";
import { MatchingCandidatesTable } from "./matching-candidates-table";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

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
    <WorkspaceShell
      session={session}
      eyebrow="Employer / Jobs / Matching"
      title={job.title}
      metrics={[
        { label: "Matched Candidates", value: result.total, note: "scored by match algorithm" },
      ]}
    >
      <div className="px-[22px] py-[18px]">
        <MatchingCandidatesTable
          candidates={result.candidates}
          total={result.total}
          jobTitle={job.title}
        />
      </div>
    </WorkspaceShell>
  );
}
