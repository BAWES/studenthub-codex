import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DataTablePage } from "@/modules/workspace/DataTablePage";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getAdminCompanyRows } from "@/modules/workspace/data";

export const dynamic = "force-dynamic";

export default async function AdminCompaniesPage() {
  const session = await requireRoleCapability("admin", "company.read.any");
  const rows = await getAdminCompanyRows();

  return (
    <WorkspaceShell session={session} eyebrow="Admin" title="Companies" metrics={[]}>
      <DataTablePage
        title="Company Accounts"
        description="Companies, ownership, active request counts, and commercial status."
        rows={rows}
        rowHref={(row) => `/admin/companies/${row.id}` as Route}
        searchable
        searchPlaceholder="Search companies by name, email, or status..."
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
