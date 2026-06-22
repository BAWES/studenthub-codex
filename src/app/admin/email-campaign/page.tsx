import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getAdminEmailCampaignRows } from "@/modules/workspace/data";

export const dynamic = "force-dynamic";

export default async function AdminEmailCampaignPage() {
  const session = await requireRoleCapability("admin", "admin.system");
  const rows = await getAdminEmailCampaignRows();

  return (
    <WorkspaceShell session={session} eyebrow="Admin" title="Email Campaigns" metrics={[]}>
      <DataTable
        title="Email Campaigns"
        description="Manage email marketing campaigns"
        rows={rows}
        rowHref={(row) => `/admin/email-campaign/${row.id}` as Route}
        columns={[
          { key: "subject", label: "Subject", render: (row) => <strong>{row.subject}</strong> },
          { key: "target", label: "Target", render: (row) => row.target },
          { key: "status", label: "Status", render: (row) => row.status },
          { key: "trigger_at", label: "Trigger", render: (row) => row.trigger_at },
          { key: "updated", label: "Updated", render: (row) => row.updated }
        ]}
      />
    </WorkspaceShell>
  );
}
