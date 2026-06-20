import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getLanguageEntry } from "./actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function CandidateLanguageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const { id } = await params;
  const data = await getLanguageEntry(Number(id));

  if (!data) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate / Languages"
      title={data.language}
      metrics={[
        { label: "Proficiency", value: data.proficiency.charAt(0).toUpperCase() + data.proficiency.slice(1), note: "Self-reported proficiency level" },
        { label: "Added", value: data.candidate_language_created_at ? formatDate(data.candidate_language_created_at) : "N/A", note: "Date added to profile" },
      ]}
    >
      <DetailSection
        title="Language Details"
        facts={[
          { label: "Language", value: data.language },
          { label: "Proficiency", value: data.proficiency.charAt(0).toUpperCase() + data.proficiency.slice(1) },
          { label: "Added", value: data.candidate_language_created_at ? formatDate(data.candidate_language_created_at) : "N/A" },
        ]}
      />
    </WorkspaceShell>
  );
}
