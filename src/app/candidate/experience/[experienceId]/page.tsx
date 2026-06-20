import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { formatDate } from "@/modules/workspace/format";
import { getExperienceEntry, deleteExperienceEntry } from "./actions";
import { DeleteExperienceButton } from "./DeleteExperienceButton";

export const dynamic = "force-dynamic";

export default async function CandidateExperienceDetailPage({
  params,
}: {
  params: Promise<{ experienceId: string }>;
}) {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const { experienceId } = await params;

  const id = Number(experienceId);
  if (isNaN(id)) notFound();

  const item = await getExperienceEntry(id);
  if (!item) {
    notFound();
  }

  const period =
    item.start_year && item.end_year
      ? `${item.start_year} – ${item.end_year}`
      : item.start_year
        ? `From ${item.start_year}`
        : item.end_year
          ? `Until ${item.end_year}`
          : "Not specified";

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate / Experience"
      title={item.experience}
      metrics={[
        { label: "Position", value: item.experience, note: "Job title" },
        { label: "Employer", value: item.employer ?? "—", note: "Company name" },
        { label: "Period", value: period, note: "Employment period" },
      ]}
    >
      <DetailSection
        title="Experience Details"
        facts={[
          { label: "Position / Title", value: item.experience },
          { label: "Employer", value: item.employer ?? "Not specified" },
          { label: "Start Year", value: item.start_year?.toString() ?? "Not specified" },
          { label: "End Year", value: item.end_year?.toString() ?? "Not specified" },
          { label: "Added On", value: item.created_at ? formatDate(item.created_at) : "N/A" },
        ]}
      />

      <div className="flex items-center gap-3 mt-8">
        <Link href={`/candidate/experience/${experienceId}/edit`}>
          <Button>Edit Experience</Button>
        </Link>
        <DeleteExperienceButton experienceId={item.candidate_experience_id} />
        <Link href="/candidate/experience">
          <Button variant="outline">Back to Experience</Button>
        </Link>
      </div>
    </WorkspaceShell>
  );
}
