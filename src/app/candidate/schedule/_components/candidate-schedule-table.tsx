"use client";

import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SessionUser } from "@/modules/auth/types";

type Row = {
  id: string;
  date: string;
  store: string;
  company: string;
  startTime: string;
  endTime: string;
  totalTime: string;
  status: string;
};

type Props = {
  session: SessionUser;
  rows: Row[];
};

export function CandidateScheduleTable({ session, rows }: Props) {
  return (
    <WorkspaceShell session={session} eyebrow="Candidate" title="Work Schedule" metrics={[]}>
      <DataTable
        title="Upcoming & Past Working Dates"
        description="Your assigned working dates, shift times, and status across all stores."
        rows={rows}
        rowHref="/candidate/schedule/"
        columns={[
          { key: "date", label: "Date", render: (row) => <strong>{row.date}</strong> },
          { key: "store", label: "Store", render: (row) => row.store },
          { key: "company", label: "Company / Store", render: (row) => row.company },
          { key: "startTime", label: "Start", render: (row) => row.startTime },
          { key: "endTime", label: "End", render: (row) => row.endTime },
          { key: "totalTime", label: "Total", render: (row) => row.totalTime },
          { key: "status", label: "Status", render: (row) => row.status },
        ]}
      />
    </WorkspaceShell>
  );
}
