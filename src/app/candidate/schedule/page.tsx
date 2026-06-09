import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getCandidateWorkingDateRows } from "@/modules/workspace/data";

export const dynamic = "force-dynamic";

export default async function CandidateSchedulePage() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const rows = await getCandidateWorkingDateRows(Number(session.id));

  return (
    <WorkspaceShell session={session} eyebrow="Candidate" title="Work Schedule" metrics={[]}>
      <DataTable
        title="Upcoming & Past Working Dates"
        description="Your assigned working dates, shift times, and status across all stores."
        rows={rows}
        rowHref={(row) => `/candidate/schedule/${row.id}` as Route}
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
