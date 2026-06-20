"use client";

import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SessionUser } from "@/modules/auth/types";
import type { AdminCompanySettingsItem } from "@/modules/admin/company-settings/schemas";

type Props = {
  session: SessionUser;
  items: AdminCompanySettingsItem[];
};

export function AdminCompanySettingsTable({ session, items }: Props) {
  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin"
      title="Company Settings"
      metrics={[
        { label: "Total companies", value: items.length, note: "Companies with settings in the system" },
      ]}
    >
      <DataTable
        title="Company Settings"
        description="All companies and their settings. Click a company to view or edit."
        rows={items.map((item) => ({ ...item, id: String(item.company_id) }))}
        rowHref="/admin/company-settings/"
        columns={[
          {
            key: "name",
            label: "Company",
            render: (row) => <strong>{row.company_name || "—"}</strong>,
          },
          {
            key: "email",
            label: "Email",
            render: (row) => row.company_email || "—",
          },
          {
            key: "website",
            label: "Website",
            render: (row) => row.company_website || "—",
          },
          {
            key: "rate",
            label: "Hourly rate",
            render: (row) =>
              row.company_hourly_rate != null ? `${row.company_hourly_rate}` : "—",
          },
          {
            key: "approved",
            label: "Approved to hire",
            render: (row) => (row.company_approved_to_hire ? "Yes" : "No"),
          },
          {
            key: "currency",
            label: "Currency",
            render: (row) => row.currency_code || "—",
          },
        ]}
      />
    </WorkspaceShell>
  );
}
