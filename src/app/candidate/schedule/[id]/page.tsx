import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getScheduleDetail } from "../actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<number, string> = {
  0: "Pending",
  1: "Confirmed",
  2: "Cancelled",
  3: "Completed",
};

function statusLabel(status: number | null): string {
  return status != null ? (STATUS_LABELS[status] ?? `Status ${status}`) : "Unknown";
}

export default async function CandidateScheduleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const { id } = await params;
  const data = await getScheduleDetail(id);

  if (!data) {
    notFound();
  }

  const store = data.store;

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate / Schedule"
      title={`${store?.store_name ?? "Working date"} · ${formatDate(data.date)}`}
      metrics={[]}
    >
      <DetailSection
        title="Working Date Details"
        facts={[
          { label: "Company", value: store?.company?.company_name },
          { label: "Store", value: store?.store_name },
          { label: "Date", value: formatDate(data.date) },
          { label: "Start Time", value: formatDate(data.start_time) },
          { label: "End Time", value: formatDate(data.end_time) },
          { label: "Total Time", value: data.total_time != null ? `${data.total_time} min` : "—" },
          { label: "Status", value: statusLabel(data.status) },
          { label: "Created", value: formatDate(data.created_at) },
          { label: "Updated", value: formatDate(data.updated_at) },
        ]}
      />
    </WorkspaceShell>
  );
}
