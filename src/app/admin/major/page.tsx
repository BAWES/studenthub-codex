import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getAdminMajorRows } from "@/modules/workspace/data";

export const dynamic = "force-dynamic";

export default async function AdminMajorPage() {
  const session = await requireRoleCapability("admin", "admin.system");
  const rows = await getAdminMajorRows();

  return (
    <WorkspaceShell session={session} eyebrow="Admin" title="Majors" metrics={[]}>
      <DataTable
        title="Majors"
        description="Manage academic majors"
        rows={rows}
        rowHref={(row) => `/admin/major/${row.id}` as Route}
        columns={[
          { key: "name_en", label: "Name (EN)", render: (row) => <strong>{row.name_en}</strong> },
          { key: "name_ar", label: "Name (AR)", render: (row) => row.name_ar },
          { key: "updated", label: "Updated", render: (row) => row.updated }
        ]}
      />
    </WorkspaceShell>
  );
}
