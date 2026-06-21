import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getAdminSettingsRows } from "@/modules/admin/settings/data";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await requireRoleCapability("admin", "admin.system");
  const rows = await getAdminSettingsRows();

  return (
    <WorkspaceShell session={session} eyebrow="Admin" title="Settings" metrics={[]}>
      <DataTable
        title="Platform Settings"
        description="Application configuration key-value pairs. Click a row to edit."
        rows={rows}
        rowHref={(row) => `/admin/settings/${row.id}` as Route}
        columns={[
          { key: "code", label: "Code", render: (row) => <strong>{row.code}</strong> },
          { key: "key", label: "Key", render: (row) => <code className="text-sm">{row.key}</code> },
          { key: "value", label: "Value", render: (row) => <span className="text-muted-foreground text-sm">{row.valuePreview}</span> },
          { key: "serialized", label: "Serialized", render: (row) => (row.serialized ? "Yes" : "No") },
          { key: "updated", label: "Updated", render: (row) => row.updated },
        ]}
      />
    </WorkspaceShell>
  );
}
