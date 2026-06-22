import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getWebhook } from "./actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function AdminWebhookDetailPage({
  params,
}: {
  params: Promise<{ webhookId: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { webhookId } = await params;
  const webhookIdNum = Number(webhookId);

  if (Number.isNaN(webhookIdNum)) {
    notFound();
  }

  const data = await getWebhook({ webhookId: webhookIdNum });

  if (!data.webhook) {
    notFound();
  }

  const webhook = data.webhook;
  const title = `${webhook.event} → ${webhook.endpoint}`;

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Webhooks"
        title={title}
        metrics={[
          {
            label: "Event",
            value: webhook.event,
            note: "Triggering event",
          },
          {
            label: "Method",
            value: webhook.method ?? "—",
            note: "HTTP method",
          },
        ]}
      >
        <DetailSection
          title="Webhook Details"
          facts={[
            { label: "ID", value: String(webhook.webhook_id) },
            { label: "Event", value: webhook.event },
            { label: "Endpoint", value: webhook.endpoint },
            { label: "Method", value: webhook.method ?? "—" },
            {
              label: "Created",
              value: webhook.created_at
                ? formatDate(new Date(webhook.created_at))
                : "—",
            },
            {
              label: "Updated",
              value: webhook.updated_at
                ? formatDate(new Date(webhook.updated_at))
                : "—",
            },
          ]}
        />
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
