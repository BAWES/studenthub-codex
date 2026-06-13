"use client";

import { DataTable } from "@/modules/workspace/DataTable";
import { RemoveContactButton } from "@/modules/company/RemoveContactButton";

interface ContactRow {
  id: string;
  name: string;
  email: string;
  position: string;
  companyName: string;
  allowAccess: boolean;
}

export function CompanyContactsTable({ rows }: { rows: ContactRow[] }) {
  return (
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
  );
}
