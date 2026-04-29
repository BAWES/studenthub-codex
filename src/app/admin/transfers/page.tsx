import type { Route } from "next";
import { requireRole } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getAdminTransferRows } from "@/modules/workspace/data";

export const dynamic = "force-dynamic";

export default async function AdminTransfersPage() {
  const session = await requireRole("admin");
  const rows = await getAdminTransferRows();

  return (
    <WorkspaceShell session={session} eyebrow="Admin" title="Transfers" metrics={[]}>
      <DataTable
        title="Transfer Runs"
        description="Recent payroll and invoice transfer records from production data."
        rows={rows}
        rowHref={(row) => `/admin/transfers/${row.id}` as Route}
        columns={[
          { key: "id", label: "Transfer", render: (row) => <strong>#{row.id}</strong> },
          { key: "company", label: "Company", render: (row) => row.company },
          { key: "period", label: "Period", render: (row) => row.period },
          { key: "status", label: "Status", render: (row) => row.status },
          { key: "total", label: "Total", render: (row) => row.total }
        ]}
      />
    </WorkspaceShell>
  );
}
