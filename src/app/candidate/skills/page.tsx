import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { formatDate } from "@/modules/workspace/format";
import { listCandidateSkills } from "./actions";

export const dynamic = "force-dynamic";

export default async function CandidateSkillsPage() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const skills = await listCandidateSkills({});

  const rows = skills.map((s) => ({
    id: s.candidate_skill_id,
    skill: s.skill,
    created_at: s.created_at ? formatDate(s.created_at) : "N/A",
  }));

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate"
      title="Skills"
      metrics={[
        { label: "Total", value: skills.length, note: "Skills on your profile" },
      ]}
    >
      <DataTable
        title="Skills"
        description="Skills and competencies associated with your candidate profile."
        rows={rows}
        rowHref="/candidate/skills/"
        columns={[
          { key: "skill", label: "Skill", render: (row) => <strong>{row.skill}</strong> },
          { key: "created_at", label: "Added", render: (row) => row.created_at },
        ]}
      />
    </WorkspaceShell>
  );
}
