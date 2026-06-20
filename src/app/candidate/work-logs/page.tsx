import { requireRoleCapability } from "@/modules/auth/session";
import { formatDate } from "@/modules/workspace/format";
import { listWorkLogs } from "./actions";
import { CandidateWorkLogsTable } from "./_components";

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

  return <CandidateWorkLogsTable session={session} rows={rows} />;
}
