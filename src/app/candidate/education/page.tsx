import { requireRoleCapability } from "@/modules/auth/session";
import { formatDate } from "@/modules/workspace/format";
import { listCandidateEducationAction } from "./actions";
import { CandidateEducationTable } from "./candidate-education-table";

export const dynamic = "force-dynamic";

export default async function CandidateEducationPage() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const items = await listCandidateEducationAction({});

  const rows = items.map((e) => ({
    id: e.education_uuid,
    university: e.university_name_en ?? e.university_name_ar ?? "—",
    degree: e.degree_name_en ?? e.degree_name_ar ?? "",
    major: e.major_name_en ?? e.major_name_ar ?? "",
    graduation_year: e.graduation_year,
    is_currently_studying: e.is_currently_studying,
    created_at: e.created_at ? formatDate(e.created_at) : "—",
  }));

  return <CandidateEducationTable session={session} rows={rows} />;
}
