"use client";

import { DataTable } from "@/modules/workspace/DataTable";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { genericStatusVariant } from "@/modules/workspace/status-mapping";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SessionUser } from "@/modules/auth/types";

type Row = {
  id: string;
  date: string;
  store: string;
  company: string;
  total: string;
  status: string;
  via: string;
};

type Props = {
  session: SessionUser;
  rows: Row[];
};

export function CandidateWorkLogsTable({ session, rows }: Props) {
  return (
    <WorkspaceShell session={session} eyebrow="Candidate" title="Work Logs" metrics={[]}>
      <DataTable
        title="Work Log History"
        description="Imported shifts, timer entries, and status values connected to your candidate account."
        rows={rows}
        rowHref="/candidate/work-logs/"
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
