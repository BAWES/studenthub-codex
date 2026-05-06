import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { CandidateProfile } from "@/modules/candidates/CandidateProfile";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getCandidateDetail } from "@/modules/workspace/data";

export const dynamic = "force-dynamic";

export default async function AdminCandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRoleCapability("admin", "candidate.read.any");
  const { id } = await params;
  const data = await getCandidateDetail(Number(id), "/admin/requests");

  if (!data.candidate) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Candidate"
      title={data.candidate.candidate_name}
      metrics={data.metrics}
    >
      <CandidateProfile
        backHref="/admin/candidates"
        detail={data}
        actions={[
          data.candidate.candidate_email ? { label: "Email", href: `mailto:${data.candidate.candidate_email}` } : null,
          data.candidate.candidate_phone ? { label: "Call", href: `tel:${data.candidate.candidate_phone}` } : null
        ].filter((action): action is { label: string; href: string } => Boolean(action))}
      />
    </WorkspaceShell>
  );
}
