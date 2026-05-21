import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getCompanyContactsRows, getCompanySelectOptions } from "@/modules/company/data";
import { AddContactForm } from "@/modules/company/AddContactForm";
import { RemoveContactButton } from "@/modules/company/RemoveContactButton";

export const dynamic = "force-dynamic";

export default async function CompanyContactsPage() {
  const session = await requireRoleCapability("company", "company.read.linked");
  const [rows, companies] = await Promise.all([
    getCompanyContactsRows(session.id),
    getCompanySelectOptions(session.id)
  ]);

  return (
    <WorkspaceShell session={session} eyebrow="Company" title="Linked Contacts" metrics={[]}>
      <AddContactForm companies={companies} />
      <DataTable
        title="Contacts"
        description="Contacts linked to companies you manage."
        rows={rows}
        columns={[
          { key: "name", label: "Name", render: (row) => <strong>{row.name}</strong> },
          { key: "email", label: "Email", render: (row) => row.email },
          { key: "position", label: "Position", render: (row) => row.position },
          { key: "company", label: "Company", render: (row) => row.companyName },
          { key: "access", label: "Access", render: (row) => (row.allowAccess ? "Allowed" : "Disabled") },
          { key: "actions", label: "Actions", render: (row) => <RemoveContactButton companyContactUuid={row.id} contactName={row.name} /> }
        ]}
      />
    </WorkspaceShell>
  );
}
