import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { FactPanel } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getMailLog } from "@/modules/mail-logs/actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminMailLogDetailPage({ params }: Props) {
  const session = await requireRoleCapability("admin", "admin.system");
  const { id } = await params;

  const record = await getMailLog(id);

  if (!record) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Mail log"
      title={`Email — ${record.subject ?? "(no subject)"}`}
      metrics={[
        { label: "Status", value: "Delivered", note: "Outgoing email" },
        { label: "App", value: record.app ?? "—", note: "Source application" },
      ]}
    >
      <FactPanel
        title="Email Details"
        facts={[
          { label: "UUID", value: record.mail_uuid },
          { label: "From", value: record.from ?? "—" },
          { label: "To", value: record.to ?? "—" },
          { label: "Subject", value: record.subject ?? "—" },
          {
            label: "App",
            value: record.app ?? "—",
          },
          {
            label: "Sent at",
            value: record.created_at
              ? formatDate(new Date(record.created_at))
              : "—",
          },
          {
            label: "Updated at",
            value: record.updated_at
              ? formatDate(new Date(record.updated_at))
              : "—",
          },
        ]}
      />
    </WorkspaceShell>
  );
}
