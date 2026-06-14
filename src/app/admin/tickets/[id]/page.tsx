import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { getTicket } from "../actions";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<number, string> = {
  0: "Open",
  1: "In Progress",
  2: "Resolved",
  3: "Closed",
};

export default async function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { id } = await params;
  const data = await getTicket(id);

  if (!data.ticket) {
    notFound();
  }

  const t = data.ticket;
  const statusLabel = STATUS_LABELS[t.ticket_status ?? 0] ?? `Status ${t.ticket_status}`;

  const responseTimeFormatted =
    t.response_time != null ? `${t.response_time} min` : null;
  const resolutionTimeFormatted =
    t.resolution_time != null ? `${t.resolution_time} min` : null;

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Tickets"
      title={`Ticket ${t.ticket_uuid.slice(0, 8)}...`}
      metrics={[
        { label: "Status", value: statusLabel, note: "Current ticket status" },
        { label: "Response Time", value: responseTimeFormatted ?? "—", note: "Time to first response" },
        { label: "Resolution Time", value: resolutionTimeFormatted ?? "—", note: "Total handling time" },
      ]}
    >
      <DetailSection
        title="Ticket Details"
        facts={[
          { label: "Status", value: statusLabel },
          { label: "Detail", value: t.ticket_detail ?? "—" },
          { label: "Candidate", value: t.candidate_name ?? "—" },
          { label: "Staff", value: t.staff_name ?? "—" },
          { label: "Response Time", value: responseTimeFormatted ?? "—" },
          { label: "Resolution Time", value: resolutionTimeFormatted ?? "—" },
          { label: "Started", value: formatDate(t.ticket_started_at) },
          { label: "Completed", value: formatDate(t.ticket_completed_at) },
          { label: "Created", value: formatDate(t.created_at) },
          { label: "Updated", value: formatDate(t.updated_at) },
        ]}
      />
    </WorkspaceShell>
  );
}
