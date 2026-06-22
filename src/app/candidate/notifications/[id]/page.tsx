import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getCandidateNotificationDetail } from "../actions";
import { formatDate } from "@/modules/workspace/format";
import { MarkReadButton } from "./MarkReadButton";

export const dynamic = "force-dynamic";

export default async function CandidateNotificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const { id } = await params;
  const data = await getCandidateNotificationDetail(Number(session.id), id);

  if (!data.notification) {
    notFound();
  }

  const n = data.notification;

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate / Notification"
      title={data.typeLabel}
      metrics={[]}
    >
      <DetailSection
        title="Notification Details"
        facts={[
          { label: "Type", value: data.typeLabel },
          { label: "Message", value: n.message ?? "No message" },
          { label: "Status", value: n.is_new ? "Unread" : "Read" },
          { label: "Created", value: formatDate(n.created_at) },
          { label: "Updated", value: formatDate(n.updated_at) },
          ...(n.invitation_uuid ? [{ label: "Invitation UUID", value: n.invitation_uuid }] : []),
          ...(n.request_uuid ? [{ label: "Request UUID", value: n.request_uuid }] : []),
        ]}
      />

      {n.is_new ? <MarkReadButton notificationUuid={n.cn_uuid} /> : null}
    </WorkspaceShell>
  );
}
