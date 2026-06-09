import { requireRoleCapability } from "@/modules/auth/session";
import { CandidateProfile } from "@/modules/candidates/CandidateProfile";
import { getCandidateProfile } from "@/modules/candidates/actions";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

export const dynamic = "force-dynamic";

export default async function CandidatePage() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const data = await getCandidateProfile({ candidateId: Number(session.id) });

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
          { label: "Edit profile", href: "/candidate/edit" },
          { label: "Notifications", href: "/candidate/notifications" },
          { label: "Invitations", href: "/candidate/invitations" },
          { label: "Skills", href: "/candidate/skills" },
          { label: "Schedule", href: "/candidate/schedule" },
          { label: "Work logs", href: "/candidate/work-logs" },
          { label: "Payments", href: "/candidate/payments" },
          data.candidate?.candidate_email ? { label: "Email support", href: `mailto:${data.candidate.candidate_email}` } : null
        ].filter((action): action is { label: string; href: string } => Boolean(action))}
      />
    </WorkspaceShell>
  );
}
