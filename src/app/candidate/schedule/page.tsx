import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { formatDate } from "@/modules/workspace/format";
import { workingDateStatusLabel } from "@/modules/workspace/data";
import { listSchedule } from "./actions";

export const dynamic = "force-dynamic";

const MAX_SCHEDULE_ROWS = 80;

export default async function CandidateSchedulePage() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const items = await listSchedule({ limit: MAX_SCHEDULE_ROWS });

  // Map ScheduleItem → DataTable row shape
  const rows = items.map((item) => ({
    id: item.cwd_uuid,
    date: formatDate(item.date),
    store: item.store_name ?? "No store",
    company: item.company_name ?? "No company",
    startTime: formatDate(item.start_time),
    endTime: formatDate(item.end_time),
    totalTime: item.total_time != null ? `${item.total_time} min` : "—",
    status: workingDateStatusLabel(item.status),
  }));

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
