import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getAdminWebhookRows } from "@/modules/workspace/data";

export const dynamic = "force-dynamic";

export default async function AdminWebhookPage() {
  const session = await requireRoleCapability("admin", "admin.system");
  const rows = await getAdminWebhookRows();

  return (
    <WorkspaceShell session={session} eyebrow="Admin" title="Webhooks" metrics={[]}>
      <DataTable
        title="Webhooks"
        description="Manage webhook endpoints"
        rows={rows}
        rowHref={(row) => `/admin/webhook/${row.id}` as Route}
        columns={[
          { key: "event", label: "Event", render: (row) => <strong>{row.event}</strong> },
          { key: "endpoint", label: "Endpoint", render: (row) => row.endpoint },
          { key: "method", label: "Method", render: (row) => row.method },
          { key: "updated", label: "Updated", render: (row) => row.updated }
        ]}
      />
    </WorkspaceShell>
  );
}
