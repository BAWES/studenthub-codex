import { requireRoleCapability } from "@/modules/auth/session";
import { formatDate } from "@/modules/workspace/format";
import { listSchedule } from "./actions";
import { CandidateScheduleTable } from "./_components";

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

  return <CandidateScheduleTable session={session} rows={rows} />;
}
