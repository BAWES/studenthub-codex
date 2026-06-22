import { notFound } from "next/navigation";
import Link from "next/link";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { formatDate } from "@/modules/workspace/format";
import { getCandidateSkill, deleteCandidateSkill } from "../actions";
import { DeleteSkillButton } from "./DeleteSkillButton";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function CandidateSkillDetailPage({
  params,
}: {
  params: Promise<{ skillId: string }>;
}) {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
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
      eyebrow="Candidate / Skills"
      title={skill.skill}
      metrics={[
        { label: "Skill", value: skill.skill, note: "Skill name" },
        { label: "Added", value: skill.created_at ? formatDate(skill.created_at) : "N/A", note: "Date added to your profile" },
      ]}
    >
      <DetailSection
        title="Skill Details"
        facts={[
          { label: "Skill Name", value: skill.skill },
          { label: "Added On", value: skill.created_at ? formatDate(skill.created_at) : "N/A" },
        ]}
      />

      <div className="flex items-center gap-3 mt-8">
        <Button asChild variant="secondary">
          <Link href={`/candidate/skills/${skillId}/edit`}>
            Edit Skill
          </Link>
        </Button>
        <DeleteSkillButton skillId={skill.candidate_skill_id} />
        <Button asChild variant="outline">
          <Link href="/candidate/skills">
            Back to Skills
          </Link>
        </Button>
      </div>
    </WorkspaceShell>
  );
}
