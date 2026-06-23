import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { SkillNewForm } from "./SkillNewForm";

export const dynamic = "force-dynamic";

export default async function CandidateSkillNewPage() {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate / Skills"
      title="Add a New Skill"
      metrics={[]}
    >
      <SkillNewForm />
    </WorkspaceShell>
  );
}
