import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getAdminEmailCampaignRows } from "@/modules/workspace/data";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminEmailCampaignPage() {
  const session = await requireRoleCapability("admin", "admin.system");
  const rows = await getAdminEmailCampaignRows();

  return (
    <WorkspaceShell session={session} eyebrow="Admin" title="Email Campaigns" metrics={[]}>
      <DataTable
        title="Email Campaigns"
        description="Manage email marketing campaigns sent to students and companies"
        rows={rows}
        rowHref={(row) => "/admin/email-campaign/" + row.id as Route}
        columns={[
          { key: "subject", label: "Subject", render: (row) => <strong>{row.subject}</strong> },
          {
            key: "status",
            label: "Status",
            render: (row) =>
              row.status ? (
                <Badge variant="success">Active</Badge>
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              ),
          },
          { key: "target", label: "Target", render: (row) => <span>{row.target}</span> },
          { key: "progress", label: "Progress", render: (row) => <span>{row.progress}%</span> },
          {
            key: "is_recurring",
            label: "Recurring",
            render: (row) => <span>{row.is_recurring ? "Yes" : "No"}</span>,
          },
          { key: "trigger_date", label: "Scheduled", render: (row) => <span>{row.trigger_date}</span> },
          { key: "updated", label: "Updated", render: (row) => <span>{row.updated}</span> },
        ]}
      />
    </WorkspaceShell>
  );
}
