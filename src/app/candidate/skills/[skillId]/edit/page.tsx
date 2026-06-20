import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getCandidateSkill } from "../../actions";
import { SkillEditForm } from "../SkillEditForm";

export const dynamic = "force-dynamic";

export default async function CandidateSkillEditPage({
  params,
}: {
  params: Promise<{ skillId: string }>;
}) {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");
  const { skillId } = await params;

  const id = Number(skillId);
  if (isNaN(id)) notFound();

  const skill = await getCandidateSkill({ skillId: id });
  if (!skill) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate / Skills / Edit"
      title={`Edit: ${skill.skill}`}
      metrics={[]}
    >
      <SkillEditForm skillId={skill.candidate_skill_id} currentName={skill.skill} />
    </WorkspaceShell>
  );
}
