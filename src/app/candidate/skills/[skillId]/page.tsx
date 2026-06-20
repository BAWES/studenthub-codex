import { notFound } from "next/navigation";
import Link from "next/link";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { formatDate } from "@/modules/workspace/format";
import { getCandidateSkill, deleteCandidateSkill } from "../actions";
import { DeleteSkillButton } from "./DeleteSkillButton";

export const dynamic = "force-dynamic";

export default async function CandidateSkillDetailPage({
  params,
}: {
  params: Promise<{ skillId: string }>;
}) {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const { skillId } = await params;

  const skill = await getCandidateSkill({ skillId: Number(skillId) });
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
        <Link href={`/candidate/skills/${skillId}/edit`} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2">
          Edit Skill
        </Link>
        <DeleteSkillButton skillId={skill.candidate_skill_id} />
        <Link href="/candidate/skills" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
          Back to Skills
        </Link>
      </div>
    </WorkspaceShell>
  );
}
