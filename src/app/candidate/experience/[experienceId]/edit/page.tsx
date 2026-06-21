import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getExperienceEntry } from "../actions";
import { ExperienceEditForm } from "../ExperienceEditForm";

export const dynamic = "force-dynamic";

export default async function CandidateExperienceEditPage({
  params,
}: {
  params: Promise<{ experienceId: string }>;
}) {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");
  const { experienceId } = await params;

  const id = Number(experienceId);
  if (isNaN(id)) notFound();

  const item = await getExperienceEntry(id);
  if (!item) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate / Experience / Edit"
      title={`Edit: ${item.experience}`}
      metrics={[]}
    >
      <ExperienceEditForm
        experienceId={item.candidate_experience_id}
        currentExperience={item.experience}
        currentEmployer={item.employer ?? ""}
        currentStartYear={item.start_year}
        currentEndYear={item.end_year}
      />
    </WorkspaceShell>
  );
}
