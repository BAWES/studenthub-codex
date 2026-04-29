import { notFound } from "next/navigation";
import { requireRole } from "@/modules/auth/session";
import { CompactList, FactPanel } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getCandidateDetail } from "@/modules/workspace/data";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function StaffCandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("staff");
  const { id } = await params;
  const data = await getCandidateDetail(Number(id));

  if (!data.candidate) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Staff / Candidate"
      title={data.candidate.candidate_name}
      metrics={data.metrics}
      primary={{ title: "Invitations", rows: data.invitations }}
      secondary={{ title: "Work History", rows: data.histories }}
    >
      <FactPanel
        title="Profile"
        facts={[
          { label: "Email", value: data.candidate.candidate_email },
          { label: "Phone", value: data.candidate.candidate_phone },
          { label: "Country", value: data.candidate.country?.country_name_en },
          { label: "University", value: data.candidate.university?.university_name_en },
          { label: "Job Search Status", value: data.candidate.candidate_job_search_status },
          { label: "Updated", value: formatDate(data.candidate.candidate_updated_at) }
        ]}
      />
      <section className="detailGrid">
        <CompactList title="Recent Work Logs" rows={data.workHours} />
        <CompactList title="Notes" rows={data.notes} />
      </section>
    </WorkspaceShell>
  );
}
