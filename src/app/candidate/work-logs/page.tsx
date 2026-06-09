import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { genericStatusVariant } from "@/modules/workspace/status-mapping";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { formatDate } from "@/modules/workspace/format";
import { listWorkLogs } from "./actions";

export const dynamic = "force-dynamic";

export default async function CandidateWorkLogsPage() {
  const session = await requireRoleCapability("candidate", "time.read.own");
  const result = await listWorkLogs({});

  const rows = result.items.map((row) => ({
    id: row.candidate_working_hour_uuid,
    date: row.date ? formatDate(row.date) : "N/A",
    store: row.store_name ?? "No store",
    company: row.company_name ?? "No company",
    total: `${row.total_time ?? 0} minutes`,
    status: `Status ${row.status ?? 0}`,
    via: row.via ?? "Not set",
  }));

  return (
    <WorkspaceShell session={session} eyebrow="Candidate" title="Work Logs" metrics={[]}>
      <DataTable
        title="Work Log History"
        description="Imported shifts, timer entries, and status values connected to your candidate account."
        rows={rows}
        rowHref={(row) => `/candidate/work-logs/${row.id}` as Route}
        columns={[
          { key: "date", label: "Date", render: (row) => <strong>{row.date}</strong> },
          { key: "store", label: "Store", render: (row) => row.store },
          { key: "company", label: "Company", render: (row) => row.company },
          { key: "total", label: "Total", render: (row) => row.total },
          { key: "status", label: "Status", render: (row) => <StatusBadge variant={genericStatusVariant(row.status)} label={row.status} size="sm" /> },
          { key: "via", label: "Via", render: (row) => row.via }
        ]}
      />
    </WorkspaceShell>
  );
}
