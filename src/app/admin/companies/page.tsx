import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { listAdminCompanies } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminCompaniesPage() {
  const session = await requireRoleCapability("admin", "company.read.any");
  const { items: rows } = await listAdminCompanies({ limit: 60 });

  return (
    <WorkspaceShell session={session} eyebrow="Admin" title="Companies" metrics={[]}>
      <DataTable
        title="Company Accounts"
        description="Companies, ownership, active request counts, and commercial status."
        rows={rows}
        rowHref="/admin/companies/"
        columns={[
          { key: "name", label: "Company", render: (row) => <strong>{row.name}</strong> },
          { key: "email", label: "Email", render: (row) => row.email },
          { key: "owner", label: "Owner", render: (row) => row.owner },
          { key: "requests", label: "Requests", render: (row) => row.requests },
          { key: "status", label: "Status", render: (row) => row.status },
          { key: "updated", label: "Updated", render: (row) => row.updated }
        ]}
      />
    </WorkspaceShell>
  );
}
