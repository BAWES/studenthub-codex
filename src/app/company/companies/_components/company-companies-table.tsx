"use client";

import type { Route } from "next";
import { DataTable } from "@/modules/workspace/DataTable";

interface CompanyAccountRow {
  id: number;
  name: string;
  email: string;
  country: string;
  requests: number;
  status: string;
  updated: string;
}

export function CompanyCompaniesTable({ rows }: { rows: CompanyAccountRow[] }) {
  return (
    <DataTable
      title="Company Accounts"
      description="Company records this contact can access through the imported production relationships."
      rows={rows}
      rowHref={(row) => `/company/companies/${row.id}` as Route}
      columns={[
        { key: "name", label: "Company", render: (row) => <strong>{row.name}</strong> },
        { key: "email", label: "Email", render: (row) => row.email },
        { key: "country", label: "Country", render: (row) => row.country },
        { key: "requests", label: "Requests", render: (row) => row.requests },
        { key: "status", label: "Status", render: (row) => row.status },
        { key: "updated", label: "Updated", render: (row) => row.updated }
      ]}
    />
  );
}
