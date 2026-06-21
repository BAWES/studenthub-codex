import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getAdminExpenseRows } from "@/modules/workspace/data";

export const dynamic = "force-dynamic";

export default async function AdminExpensePage() {
  const session = await requireRoleCapability("admin", "admin.system");
  const rows = await getAdminExpenseRows();

  return (
    <WorkspaceShell session={session} eyebrow="Admin" title="Expenses" metrics={[]}>
      <DataTable
        title="Expenses"
        description="Administrative expenses and disbursements"
        rows={rows}
        rowHref={(row) => `/admin/expense/${row.id}` as Route}
        columns={[
          { key: "title", label: "Title", render: (row) => <strong>{row.title}</strong> },
          { key: "type", label: "Type", render: (row) => row.type },
          { key: "amount", label: "Amount", render: (row) => row.amount },
          { key: "transactionDate", label: "Transaction Date", render: (row) => row.transactionDate },
          { key: "updated", label: "Updated", render: (row) => row.updated }
        ]}
      />
    </WorkspaceShell>
  );
}
