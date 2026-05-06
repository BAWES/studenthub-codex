import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getCandidateWorkLogRows } from "@/modules/workspace/data";

export const dynamic = "force-dynamic";

export default async function CandidateWorkLogsPage() {
  const session = await requireRoleCapability("candidate", "time.read.own");
  const rows = await getCandidateWorkLogRows(Number(session.id));

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
          { key: "status", label: "Status", render: (row) => row.status },
          { key: "via", label: "Via", render: (row) => row.via }
        ]}
      />
    </WorkspaceShell>
  );
}
