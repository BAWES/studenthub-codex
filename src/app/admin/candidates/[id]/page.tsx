import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { getCandidateDetail } from "@/modules/candidates/candidate-detail";
import { formatDate, formatMoney } from "@/modules/workspace/format";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { DetailSection } from "@/modules/workspace/DetailPanels";

export const dynamic = "force-dynamic";

export default async function AdminCandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "candidate.search");
  const { id } = await params;
  const candidateId = Number(id);

  if (!Number.isInteger(candidateId) || candidateId <= 0) {
    notFound();
  }

  const data = await getCandidateDetail(candidateId, "/admin/requests");
  const { candidate } = data;

  if (!candidate) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Candidates"
      title={candidate.candidate_name ?? `Candidate #${candidate.candidate_id}`}
      metrics={data.metrics}
    >
      {/* ── Personal Info ──────────────────────────────────── */}
      <DetailSection
        title="Personal Information"
        facts={[
          { label: "Name", value: candidate.candidate_name },
          { label: "Name (Arabic)", value: candidate.candidate_name_ar },
          { label: "Email", value: candidate.candidate_email },
          {
            label: "Email Verified",
            value: candidate.candidate_email_verification ? "Yes" : "No",
          },
          { label: "Phone", value: candidate.candidate_phone },
          { label: "Civil ID", value: candidate.candidate_civil_id },
          {
            label: "Civil ID Expiry",
            value: formatDate(candidate.candidate_civil_expiry_date),
          },
          { label: "Gender", value: candidate.candidate_gender },
          {
            label: "Birth Date",
            value: formatDate(candidate.candidate_birth_date),
          },
          {
            label: "Driving License",
            value: candidate.candidate_driving_license ? "Yes" : "No",
          },
          { label: "Country", value: candidate.country?.country_name_en },
          { label: "University", value: candidate.university?.university_name_en },
          { label: "Address", value: candidate.candidate_address_line1 },
          {
            label: "Created",
            value: formatDate(candidate.candidate_created_at),
          },
          {
            label: "Updated",
            value: formatDate(candidate.candidate_updated_at),
          },
        ]}
      />

      {/* ── Skills ─────────────────────────────────────────── */}
      {data.skills.length > 0 && (
        <DetailSection
          title="Skills"
          rows={data.skills}
        />
      )}

      {/* ── Languages ──────────────────────────────────────── */}
      {data.languages.length > 0 && (
        <DetailSection
          title="Languages"
          rows={data.languages}
        />
      )}

      {/* ── Education ──────────────────────────────────────── */}
      {data.education.length > 0 && (
        <DetailSection
          title="Education"
          rows={data.education}
        />
      )}

      {/* ── Experience ─────────────────────────────────────── */}
      {data.experiences.length > 0 && (
        <DetailSection
          title="Experience"
          rows={data.experiences}
        />
      )}

      {/* ── Certificates ───────────────────────────────────── */}
      {data.certificates.length > 0 && (
        <DetailSection
          title="Certificates"
          rows={data.certificates}
        />
      )}

      {/* ── Invitations ────────────────────────────────────── */}
      {data.invitations.length > 0 && (
        <DetailSection
          title="Invitations"
          rows={data.invitations}
        />
      )}

      {/* ── Applications ───────────────────────────────────── */}
      {data.applications.length > 0 && (
        <DetailSection
          title="Applications"
          rows={data.applications}
        />
      )}

      {/* ── Interviews ─────────────────────────────────────── */}
      {data.interviews.length > 0 && (
        <DetailSection
          title="Interviews"
          rows={data.interviews}
        />
      )}

      {/* ── Tags ───────────────────────────────────────────── */}
      {data.tags.length > 0 && (
        <DetailSection
          title="Tags"
          rows={data.tags}
        />
      )}

      {/* ── Notes ──────────────────────────────────────────── */}
      {data.notes.length > 0 && (
        <DetailSection
          title="Notes"
          rows={data.notes}
        />
      )}

      {/* ── Warnings ───────────────────────────────────────── */}
      {data.warnings.length > 0 && (
        <DetailSection
          title="Warnings"
          rows={data.warnings}
        />
      )}

      {/* ── Work History ───────────────────────────────────── */}
      {data.histories.length > 0 && (
        <DetailSection
          title="Work History"
          rows={data.histories}
        />
      )}

      {/* ── Work Hours ─────────────────────────────────────── */}
      {data.workHours.length > 0 && (
        <DetailSection
          title="Work Hours"
          rows={data.workHours}
        />
      )}

      {/* ── Revenue ────────────────────────────────────────── */}
      {data.stats && (
        <DetailSection
          title="Revenue"
          facts={[
            { label: "Total Revenue", value: data.stats.totalRevenue },
            { label: "Updated", value: data.stats.updated },
          ]}
        />
      )}
    </WorkspaceShell>
  );
}
