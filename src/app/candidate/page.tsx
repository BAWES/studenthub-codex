import { requireRoleCapability } from "@/modules/auth/session";
import { CandidateProfile } from "@/modules/candidates/CandidateProfile";
import { getCandidateDetail } from "@/modules/workspace/data";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

export const dynamic = "force-dynamic";

export default async function CandidatePage() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const data = await getCandidateDetail(Number(session.id), "/candidate/invitations");

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate Workspace"
      title={`Your StudentHub profile, ${data.candidate?.candidate_name ?? session.name}.`}
      metrics={data.metrics}
    >
      <CandidateProfile
        detail={data}
        actions={[
          { label: "Invitations", href: "/candidate/invitations" },
          { label: "Work logs", href: "/candidate/work-logs" },
          data.candidate?.candidate_email ? { label: "Email support", href: `mailto:${data.candidate.candidate_email}` } : null
        ].filter((action): action is { label: string; href: string } => Boolean(action))}
      />
    </WorkspaceShell>
  );
}
