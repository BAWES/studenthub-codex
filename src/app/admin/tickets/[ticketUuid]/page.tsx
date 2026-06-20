import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { getTicket } from "./actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<number, string> = {
  0: "Open",
  1: "In Progress",
  2: "Resolved",
  3: "Closed",
};

function getStatusLabel(status: number | null): string {
  if (status === null) return "Unknown";
  return STATUS_LABELS[status] ?? `Unknown (${status})`;
}

export default async function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ ticketUuid: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { ticketUuid } = await params;

  const result = await getTicket(ticketUuid);

  if (!result.ticket) {
    notFound();
  }

  const ticket = result.ticket;

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Tickets"
        title={ticket.ticket_detail ?? "Ticket Detail"}
        metrics={[
          { label: "Status", value: getStatusLabel(ticket.ticket_status), note: "" },
          {
            label: "Response Time",
            value: ticket.response_time ? `${ticket.response_time}h` : "—",
            note: "",
          },
          {
            label: "Resolution Time",
            value: ticket.resolution_time ? `${ticket.resolution_time}h` : "—",
            note: "",
          },
        ]}
      >
        <DetailSection
          title="Ticket Details"
          facts={[
            { label: "Detail", value: ticket.ticket_detail ?? "—" },
            { label: "Status", value: getStatusLabel(ticket.ticket_status) },
            {
              label: "Candidate",
              value: ticket.candidate_name ?? "—",
            },
            { label: "Staff", value: ticket.staff_name ?? "—" },
            {
              label: "Started",
              value: ticket.ticket_started_at
                ? formatDate(new Date(ticket.ticket_started_at))
                : "—",
            },
            {
              label: "Completed",
              value: ticket.ticket_completed_at
                ? formatDate(new Date(ticket.ticket_completed_at))
                : "—",
            },
            {
              label: "Response Time",
              value: ticket.response_time ? `${ticket.response_time} hours` : "—",
            },
            {
              label: "Resolution Time",
              value: ticket.resolution_time ? `${ticket.resolution_time} hours` : "—",
            },
            {
              label: "Created",
              value: ticket.created_at
                ? formatDate(new Date(ticket.created_at))
                : "—",
            },
            {
              label: "Updated",
              value: ticket.updated_at
                ? formatDate(new Date(ticket.updated_at))
                : "—",
            },
          ]}
        />

        <section className="flex gap-2 p-4">
          <Link href={"/admin/tickets" as Route}>
            <Button variant="outline">Back to Tickets</Button>
          </Link>
        </section>
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
