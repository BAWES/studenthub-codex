import { requireRoleCapability } from "@/modules/auth/session";
import { formatDate } from "@/modules/workspace/format";
import { listCandidateExperience } from "./actions";
import { CandidateExperienceTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function CandidateExperiencePage() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const items = await listCandidateExperience({});

  const rows = items.map((e) => ({
    id: e.candidate_experience_id,
    experience: e.experience,
    employer: e.employer ?? "—",
    period:
      e.start_year && e.end_year
        ? `${e.start_year} – ${e.end_year}`
        : e.start_year
          ? `From ${e.start_year}`
          : e.end_year
            ? `Until ${e.end_year}`
            : "—",
    created_at: e.created_at ? formatDate(e.created_at) : "N/A",
  }));

  return <CandidateExperienceTable session={session} rows={rows} />;
}
