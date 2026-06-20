import { requireRoleCapability } from "@/modules/auth/session";
import { formatDate } from "@/modules/workspace/format";
import { listCandidateEducationAction } from "./actions";
import { CandidateEducationTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function CandidateEducationPage() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const items = await listCandidateEducationAction({});

  const rows = items.map((item) => ({
    id: item.education_uuid,
    university: item.university_name_en ?? item.university_name_ar ?? "—",
    degree: item.degree_name_en ?? item.degree_name_ar ?? "—",
    major: item.major_name_en ?? item.major_name_ar ?? "—",
    graduationYear: item.graduation_year?.toString() ?? "—",
    status: item.is_currently_studying ? "Currently Studying" : "Completed",
    created_at: item.created_at ? formatDate(item.created_at) : "N/A",
  }));

  return <CandidateEducationTable session={session} rows={rows} />;
}
