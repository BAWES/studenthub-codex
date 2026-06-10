import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { formatDate } from "@/modules/workspace/format";
import { listSchedule } from "./actions";

const STATUS_LABELS: Record<number, string> = {
  0: "Pending",
  1: "Confirmed",
  2: "Cancelled",
  3: "Completed",
};

function statusLabel(status: number | null): string {
  return status != null ? (STATUS_LABELS[status] ?? `Status ${status}`) : "Unknown";
}

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
    status: statusLabel(item.status),
  }));

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
