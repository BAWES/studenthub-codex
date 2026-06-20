import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { getMailLog } from "@/modules/mail-logs/actions";

export const dynamic = "force-dynamic";

export default async function AdminMailLogDetailPage({
  params,
}: {
  params: Promise<{ mailUuid: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { mailUuid } = await params;

  const record = await getMailLog(mailUuid);

  if (!record) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Mail log"
      title={`Email — ${record.subject ?? "(no subject)"}`}
      metrics={[
        { label: "From", value: record.from ?? "—", note: "Sender" },
        { label: "To", value: record.to ?? "—", note: "Recipient" },
        { label: "App", value: record.app ?? "—", note: "Source application" },
      ]}
    >
      <DetailSection
        title="Email Details"
        facts={[
          { label: "Mail UUID", value: record.mail_uuid },
          { label: "From", value: record.from ?? "—" },
          { label: "To", value: record.to ?? "—" },
          { label: "Subject", value: record.subject ?? "—" },
          { label: "Application", value: record.app ?? "—" },
          {
            label: "Sent at",
            value: record.created_at
              ? new Date(record.created_at).toLocaleString()
              : "—",
          },
          {
            label: "Updated at",
            value: record.updated_at
              ? new Date(record.updated_at).toLocaleString()
              : "—",
          },
        ]}
      />

      <section className="flex gap-2 p-4">
        <Link href={"/admin/mail-log" as Route}>
          <Button variant="outline">Back to Mail Log</Button>
        </Link>
      </section>
    </WorkspaceShell>
  );
}
