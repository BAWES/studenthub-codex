import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { CandidateProfile } from "@/modules/candidates/CandidateProfile";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getStaffCandidateDetail } from "@/modules/workspace/data";

export const dynamic = "force-dynamic";

export default async function StaffCandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRoleCapability("staff", "candidate.read.assigned");
  const { id } = await params;
  const data = await getStaffCandidateDetail(Number(session.id), Number(id));

  if (!data?.candidate) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Staff / Candidate"
      title={data.candidate.candidate_name}
      metrics={data.metrics}
    >
      <CandidateProfile
        backHref="/staff/candidates"
        detail={data}
        actions={[
          data.candidate.candidate_email ? { label: "Email", href: `mailto:${data.candidate.candidate_email}` } : null,
          data.candidate.candidate_phone ? { label: "Call", href: `tel:${data.candidate.candidate_phone}` } : null
        ].filter((action): action is { label: string; href: string } => Boolean(action))}
      />
    </WorkspaceShell>
  );
}
