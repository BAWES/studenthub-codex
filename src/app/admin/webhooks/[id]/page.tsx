import { redirect } from "next/navigation";
import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getWebhook } from "./actions";
import { deleteWebhook } from "../actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function AdminWebhookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { id } = await params;
  const webhookIdNum = Number(id);

  if (Number.isNaN(webhookIdNum)) {
    notFound();
  }

  const webhook = await getWebhook(webhookIdNum);

  if (!webhook) {
    notFound();
  }

  async function handleDelete() {
    "use server";
    await deleteWebhook(webhookIdNum);
    redirect("/admin/webhooks");
  }

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Webhooks"
        title={`Webhook #${webhook.webhook_id}`}
        metrics={[]}
      >
        <DetailSection
          title="Webhook Details"
          facts={[
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

        <form action={handleDelete} className="mt-6">
          <button
            type="submit"
            className="text-sm px-3 py-1.5 rounded border border-red-500/30 text-destructive hover:bg-red-500/10"
          >
            Delete webhook
          </button>
        </form>
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
