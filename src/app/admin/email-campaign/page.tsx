import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { formatDate } from "@/modules/workspace/format";
import { listEmailCampaigns } from "./actions";
import type { EmailCampaignRow } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminEmailCampaignPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const campaigns = await listEmailCampaigns();

  const activeCount = campaigns.filter((c: EmailCampaignRow) => c.status).length;
  const scheduledCount = campaigns.filter((c: EmailCampaignRow) => c.trigger_at !== null).length;

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin"
      title="Email Campaigns"
      metrics={[
        { label: "Total campaigns", value: campaigns.length, note: "In the system" },
        { label: "Active", value: activeCount, note: "Currently enabled" },
        { label: "Scheduled", value: scheduledCount, note: "With trigger date" },
      ]}
    >
      <DataTable
        title="Email Campaigns"
        description="Manage automated email campaigns. Click a row to view details."
        rows={campaigns}
        rowHref={(row: EmailCampaignRow) => `/admin/email-campaign/${row.id}` as Route}
        columns={[
          {
            key: "subject",
            label: "Subject",
            render: (row: EmailCampaignRow) => <strong>{row.subject}</strong>,
          },
          {
            key: "status",
            label: "Status",
            render: (row: EmailCampaignRow) => (row.status ? "Active" : "Inactive"),
          },
          {
            key: "progress",
            label: "Progress",
            render: (row: EmailCampaignRow) => `${row.progress}%`,
          },
          {
            key: "target",
            label: "Target",
            render: (row: EmailCampaignRow) => row.target ?? "both",
          },
          {
            key: "trigger_at",
            label: "Scheduled",
            render: (row: EmailCampaignRow) =>
              row.trigger_at ? new Date(row.trigger_at).toLocaleDateString() : "Not scheduled",
          },
          {
            key: "updated_at",
            label: "Updated",
            render: (row: EmailCampaignRow) => (row.updated_at ? formatDate(new Date(row.updated_at)) : "—"),
          },
        ]}
      />
    </WorkspaceShell>
  );
}
