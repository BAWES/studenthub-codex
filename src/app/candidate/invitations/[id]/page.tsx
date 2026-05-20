import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { CompactList, FactPanel } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getCandidateInvitationDetail } from "@/modules/workspace/data";
import { formatDate } from "@/modules/workspace/format";
import { InvitationRespondForm } from "@/modules/candidates/InvitationRespondForm";

export const dynamic = "force-dynamic";

export default async function CandidateInvitationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const { id } = await params;
  const data = await getCandidateInvitationDetail(Number(session.id), id);

  if (!data.invitation) {
    notFound();
  }

  const inv = data.invitation;

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate / Invitation"
      title={inv.request.request_position_title ?? "Invitation"}
      metrics={data.metrics}
      primary={{ title: "Notes", rows: data.notes }}
    >
      <FactPanel
        title="Invitation Brief"
        facts={[
          { label: "Company", value: inv.request.company?.company_name },
          { label: "Compensation", value: inv.request.request_compensation },
          { label: "Location", value: inv.request.request_location },
          { label: "Seats", value: inv.request.request_number_of_employees },
          { label: "Staff Owner", value: inv.request.staff?.staff_name },
          { label: "Status", value: `Status ${inv.invitation_status ?? 0}` },
          { label: "Created", value: formatDate(inv.invitation_created_at) },
          { label: "Updated", value: formatDate(inv.invitation_updated_at) },
        ]}
      />

      <InvitationRespondForm
        invitationUuid={inv.invitation_uuid}
        currentStatus={inv.invitation_status ?? 0}
      />
    </WorkspaceShell>
  );
}
