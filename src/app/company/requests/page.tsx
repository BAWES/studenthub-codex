import type { Route } from "next";
import Link from "next/link";
import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getCompanyRequestRows } from "@/modules/workspace/data";

export const dynamic = "force-dynamic";

const statusBadge = (status: string) => {
  const colors: Record<string, string> = {
    pending: "bg-[#f59e0b]",
    started: "bg-[#3b82f6]",
    delivered: "bg-[#10b981]",
    cancelled: "bg-[#ef4444]",
    finished_by_recruitment: "bg-[#8b5cf6]",
  };
  const bg = colors[status] ?? "bg-[#6b7280]";
  return (
    <span
      className={`${bg} inline-block px-[0.625rem] py-[0.125rem] rounded-full text-[0.75rem] font-semibold text-white capitalize`}
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
        <Link
          href="/company/requests/create"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-[6px] bg-[var(--sh-coral)] text-white font-semibold text-[0.875rem] no-underline hover:bg-[var(--sh-coral-hover)] transition-colors"
        >
          + New Request
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
