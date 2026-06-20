import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { ExperienceNewForm } from "./ExperienceNewForm";

export const dynamic = "force-dynamic";

export default async function CandidateExperienceNewPage() {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate / Experience"
      title="Add Work Experience"
      metrics={[]}
    >
      <ExperienceNewForm />
    </WorkspaceShell>
  );
}
