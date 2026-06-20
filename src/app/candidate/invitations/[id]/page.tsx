import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { formatDate } from "@/modules/workspace/format";
import { InvitationRespondForm } from "@/modules/candidates/InvitationRespondForm";
import { getCandidateInvitationDetail } from "../actions";

export const dynamic = "force-dynamic";

export default async function CandidateInvitationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const { id } = await params;
  const data = await getCandidateInvitationDetail({ invitationUuid: id });

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
      <DetailSection
        title="Invitation Brief"
        facts={[
          { label: "Company", value: inv.request.company_name },
          { label: "Compensation", value: inv.request.request_compensation },
          { label: "Location", value: inv.request.request_location },
          { label: "Seats", value: inv.request.request_number_of_employees },
          { label: "Staff Owner", value: inv.request.staff_name },
          { label: "Status", value: `Status ${inv.invitation_status ?? 0}` },
          { label: "Created", value: inv.invitation_created_at ? formatDate(inv.invitation_created_at) : "N/A" },
          { label: "Updated", value: inv.invitation_updated_at ? formatDate(inv.invitation_updated_at) : "N/A" },
        ]}
      />

      <InvitationRespondForm
        invitationUuid={inv.invitation_uuid}
        currentStatus={inv.invitation_status ?? 0}
      />
    </WorkspaceShell>
  );
}
