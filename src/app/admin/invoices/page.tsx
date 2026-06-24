import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getAdminInvoiceRows } from "@/modules/workspace/data";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const statusBadgeLabel = (status: string) => {
  switch (status) {
    case "paid":
      return "paid";
    case "unpaid":
      return "unpaid";
    default:
      return status;
  }
};

export default async function AdminInvoicePage() {
  const session = await requireRoleCapability("admin", "admin.system");
  const rows = await getAdminInvoiceRows();

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin"
      title="Invoices — manage billing records"
      metrics={[
        {
          label: "Invoices",
          value: rows.length,
          note: "Billing records",
        },
      ]}
    >
      <DataTable
        title="Invoices"
        description="View and manage invoices linked to transfer runs"
        rows={rows}
        rowHref={(row) => `/admin/invoices/${row.id}` as Route}
        columns={[
          {
            key: "invoice_id",
            label: "ID",
            render: (row) => <span className="font-mono text-xs">#{row.invoice_id}</span>,
          },
          {
            key: "company",
            label: "Company",
            render: (row) => row.company,
          },
          {
            key: "date",
            label: "Date",
            render: (row) => row.date,
          },
          {
            key: "status",
            label: "Status",
            render: (row) => (
              <Badge variant={row.status === "paid" ? "default" : row.status === "unpaid" ? "destructive" : "secondary"}>
                {statusBadgeLabel(row.status)}
              </Badge>
            ),
          },
          {
            key: "total",
            label: "Total",
            render: (row) => row.total,
          },
          {
            key: "transfer_status",
            label: "Transfer",
            render: (row) => row.transfer_status,
          },
        ]}
      />
    </WorkspaceShell>
  );
}
