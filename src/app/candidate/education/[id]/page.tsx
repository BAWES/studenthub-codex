import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getEducationEntry } from "./actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function CandidateEducationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const { id } = await params;
  const data = await getEducationEntry(id);

  if (!data) {
    notFound();
  }

  const universityName = data.university_name_en ?? data.university_name_ar ?? "—";
  const degreeName = data.degree_name_en ?? data.degree_name_ar ?? "—";
  const majorName = data.major_name_en ?? data.major_name_ar ?? "—";

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate / Education"
      title={`${universityName} · ${degreeName}`}
      metrics={[
        { label: "Status", value: data.is_currently_studying ? "Currently Studying" : "Completed", note: "Current education status" },
        { label: "Graduation", value: data.graduation_year?.toString() ?? "N/A", note: "Expected or completed graduation year" },
        { label: "Added", value: data.created_at ? formatDate(data.created_at) : "N/A", note: "Date added to profile" },
        { label: "Updated", value: data.updated_at ? formatDate(data.updated_at) : "N/A", note: "Last updated" },
      ]}
    >
      <DetailSection
        title="Education Details"
        facts={[
          { label: "University", value: universityName },
          { label: "Degree", value: degreeName },
          { label: "Major", value: majorName },
          { label: "Graduation Year", value: data.graduation_year?.toString() ?? "—" },
          { label: "Status", value: data.is_currently_studying ? "Currently Studying" : "Completed" },
          { label: "Added", value: data.created_at ? formatDate(data.created_at) : "N/A" },
          { label: "Updated", value: data.updated_at ? formatDate(data.updated_at) : "N/A" },
        ]}
      />
    </WorkspaceShell>
  );
}
