"use client";

import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { AddContactForm } from "@/modules/company/AddContactForm";
import { RemoveContactButton } from "@/modules/company/RemoveContactButton";
import type { SessionUser } from "@/modules/auth/types";

type Row = Record<string, unknown> & { id: string | number };

type Props = {
  session: SessionUser;
  rows: Row[];
  companies: { id: number; name: string }[];
};

export function CompanyContactsTable({ session, rows, companies }: Props) {
  return (
    <WorkspaceShell session={session} eyebrow="Company" title="Linked Contacts" metrics={[]}>
      <AddContactForm companies={companies} />
      <DataTable
        title="Contacts"
        description="Contacts linked to companies you manage."
        rows={rows}
        columns={[
          { key: "name", label: "Name", render: (row) => <strong>{String(row.name)}</strong> },
          { key: "email", label: "Email", render: (row) => String(row.email) },
          { key: "position", label: "Position", render: (row) => String(row.position) },
          { key: "company", label: "Company", render: (row) => String(row.companyName) },
          { key: "access", label: "Access", render: (row) => (row.allowAccess ? "Allowed" : "Disabled") },
          { key: "actions", label: "Actions", render: (row) => <RemoveContactButton companyContactUuid={String(row.id)} contactName={String(row.name)} /> }
        ]}
      />
    </WorkspaceShell>
  );
}
