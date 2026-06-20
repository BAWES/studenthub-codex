import { Button } from "@/components/ui/button";
import type { Route } from "next";
import Link from "next/link";
import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getCompanyRequestRows } from "@/modules/workspace/data";

export const dynamic = "force-dynamic";

const statusBadge = (status: string) => {
  const colors: Record<string, string> = {
    pending: "#f59e0b",
    started: "#3b82f6",
    delivered: "#10b981",
    cancelled: "#ef4444",
    finished_by_recruitment: "#8b5cf6",
  };
  const color = colors[status] ?? "#6b7280";
  return (
    <span
      className="inline-block px-[0.625rem] py-[0.125rem] rounded-full text-xs font-semibold text-white"
      style={{ backgroundColor: color }}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
};

export default async function CompanyRequestsPage() {
  const session = await requireRoleCapability("company", "request.read.linked");
  const rows = await getCompanyRequestRows(session.id);

  return (
    <WorkspaceShell session={session} eyebrow="Company" title="Requests" metrics={[]}>
      <div className="mb-4">
        <Link href="/company/requests/create">
          <Button>+ New Request</Button>
        </Link>
      </div>
      <DataTable
        title="Hiring Requests"
        description="Requests across the company accounts linked to this contact."
        rows={rows}
        rowHref={(row) => `/company/requests/${row.id}` as Route}
        columns={[
          { key: "title", label: "Request", render: (row) => <strong>{row.title}</strong> },
          { key: "company", label: "Company", render: (row) => row.company },
          { key: "owner", label: "Owner", render: (row) => row.owner },
          { key: "seats", label: "Seats", render: (row) => row.seats },
          {
            key: "status",
            label: "Status",
            render: (row) => statusBadge(row.status as string),
          },
          { key: "updated", label: "Updated", render: (row) => row.updated }
        ]}
      />
    </WorkspaceShell>
  );
}
