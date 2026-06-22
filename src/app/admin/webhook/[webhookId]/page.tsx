import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { formatDate } from "@/modules/workspace/format";
import { getWebhookDetail } from "../actions";
import { WebhookDetailForm } from "./WebhookDetailForm";

export const dynamic = "force-dynamic";

export default async function AdminWebhookDetailPage({ params }: { params: Promise<{ webhookId: string }> }) {
  const session = await requireRoleCapability("admin", "admin.system");
  const { webhookId } = await params;

  const webhook = await getWebhookDetail(Number(webhookId));
  if (!webhook) notFound();

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Webhooks"
      title={`${webhook.event} → ${webhook.endpoint}`}
      metrics={[
        { label: "Created", value: formatDate(webhook.created_at), note: "Record created" },
        { label: "Updated", value: formatDate(webhook.updated_at), note: "Last modified" }
      ]}
    >
      <WebhookDetailForm webhook={webhook} />
    </WorkspaceShell>
  );
}
