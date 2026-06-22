import { requireRoleCapability } from "@/modules/auth/session";
import { formatDate } from "@/modules/workspace/format";
import { listCandidateLanguages } from "./actions";
import { CandidateLanguagesTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function CandidateLanguagesPage() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const languages = await listCandidateLanguages({});

  const rows = languages.map((l) => ({
    id: l.candidate_language_id,
    language: l.language,
    proficiency: l.proficiency,
    created_at: l.candidate_language_created_at
      ? formatDate(l.candidate_language_created_at)
      : "N/A",
  }));

  return <CandidateLanguagesTable session={session} rows={rows} />;
}
