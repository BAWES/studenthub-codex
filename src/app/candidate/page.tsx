import { requireRole } from "@/modules/auth/session";
import { getCandidateWorkspace } from "@/modules/workspace/data";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

export const dynamic = "force-dynamic";

export default async function CandidatePage() {
  const session = await requireRole("candidate");
  const data = await getCandidateWorkspace(Number(session.id));

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate Workspace"
      title={`Your StudentHub profile, ${data.candidate?.candidate_name ?? session.name}.`}
      metrics={data.metrics}
      primary={{ title: "Invitations", rows: data.invitations }}
      secondary={{ title: "Recent Work Logs", rows: data.hours }}
    />
  );
}
