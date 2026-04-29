import { notFound } from "next/navigation";
import { requireRole } from "@/modules/auth/session";
import { CompactList, FactPanel } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getCandidateInvitationDetail } from "@/modules/workspace/data";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function CandidateInvitationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("candidate");
  const { id } = await params;
  const data = await getCandidateInvitationDetail(Number(session.id), id);

  if (!data.invitation) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate / Invitation"
      title={data.invitation.request.request_position_title ?? "Invitation"}
      metrics={data.metrics}
      primary={{ title: "Notes", rows: data.notes }}
    >
      <FactPanel
        title="Invitation Brief"
        facts={[
          { label: "Company", value: data.invitation.request.company?.company_name },
          { label: "Compensation", value: data.invitation.request.request_compensation },
          { label: "Location", value: data.invitation.request.request_location },
          { label: "Seats", value: data.invitation.request.request_number_of_employees },
          { label: "Staff Owner", value: data.invitation.request.staff?.staff_name },
          { label: "Created", value: formatDate(data.invitation.invitation_created_at) },
          { label: "Updated", value: formatDate(data.invitation.invitation_updated_at) }
        ]}
      />
    </WorkspaceShell>
  );
}
