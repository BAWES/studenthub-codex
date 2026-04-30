import { notFound } from "next/navigation";
import Link from "next/link";
import { requireRole } from "@/modules/auth/session";
import { CompactList, FactPanel } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getStaffCandidateDetail } from "@/modules/workspace/data";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function StaffCandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("staff");
  const { id } = await params;
  const data = await getStaffCandidateDetail(Number(session.id), Number(id));

  if (!data?.candidate) {
    notFound();
  }

  const flags = [
    data.candidate.approved === 0 ? "Needs review" : "Approved",
    data.candidate.candidate_status === 10 ? "Active" : `Status ${data.candidate.candidate_status}`,
    data.candidate.is_incomplete_profile ? "Incomplete profile" : null,
    data.candidate.candidate_civil_need_verification ? "Civil ID review" : null
  ].filter((flag): flag is string => Boolean(flag));

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Staff / Candidate"
      title={data.candidate.candidate_name}
      metrics={data.metrics}
      primary={{ title: "Invitations", rows: data.invitations }}
      secondary={{ title: "Work History", rows: data.histories }}
    >
      <section className="candidateCommand">
        <div className="candidateIdentity">
          <span>{data.candidate.candidate_uid ?? `#${data.candidate.candidate_id}`}</span>
          <strong>{data.candidate.candidate_name_ar ?? data.candidate.candidate_name}</strong>
          <div className="statusPills">
            {flags.map((flag) => (
              <span key={flag}>{flag}</span>
            ))}
          </div>
        </div>
        <div className="candidateActions" aria-label="Candidate actions">
          <Link href="/staff/candidates">Directory</Link>
          {data.candidate.candidate_email ? <a href={`mailto:${data.candidate.candidate_email}`}>Email</a> : null}
          {data.candidate.candidate_phone ? <a href={`tel:${data.candidate.candidate_phone}`}>Call</a> : null}
        </div>
      </section>

      <FactPanel
        title="Profile"
        facts={[
          { label: "Candidate ID", value: data.candidate.candidate_id },
          { label: "Email", value: data.candidate.candidate_email },
          { label: "Phone", value: data.candidate.candidate_phone },
          { label: "Country", value: data.candidate.country?.country_name_en },
          { label: "University", value: data.candidate.university?.university_name_en },
          { label: "Job Search Status", value: data.candidate.candidate_job_search_status },
          { label: "Civil ID Review", value: data.candidate.candidate_civil_need_verification ? "Required" : "Clear" },
          { label: "Profile", value: data.candidate.is_incomplete_profile ? "Incomplete" : "Complete" },
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
