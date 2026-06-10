import { requireRoleCapability } from "@/modules/auth/session";
import { formatDate } from "@/modules/workspace/format";
import { listCandidateSkills } from "./actions";
import { CandidateSkillsTable } from "./candidate-skills-table";

export const dynamic = "force-dynamic";

export default async function CandidateSkillsPage() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const skills = await listCandidateSkills({});

  const rows = skills.map((s) => ({
    id: s.candidate_skill_id,
    skill: s.skill,
    created_at: s.created_at ? formatDate(s.created_at) : "N/A",
  }));

  return <CandidateSkillsTable session={session} rows={rows} />;
}
