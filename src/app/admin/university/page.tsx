import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getAdminUniversityRows } from "@/modules/workspace/data";

export const dynamic = "force-dynamic";

export default async function AdminUniversityPage() {
  const session = await requireRoleCapability("admin", "admin.system");
  const rows = await getAdminUniversityRows();

  return (
    <WorkspaceShell session={session} eyebrow="Admin" title="Universities" metrics={[]}>
      <DataTable
        title="Universities"
        description="Manage university listings"
        rows={rows}
        rowHref={(row) => `/admin/university/${row.id}` as Route}
        columns={[
          { key: "name_en", label: "Name (EN)", render: (row) => <strong>{row.name_en}</strong> },
          { key: "name_ar", label: "Name (AR)", render: (row) => row.name_ar },
          { key: "candidates", label: "Candidates", render: (row) => row.candidates },
          { key: "data_source", label: "Data Source", render: (row) => row.data_source },
          { key: "updated", label: "Updated", render: (row) => row.updated }
        ]}
      />
    </WorkspaceShell>
  );
}
