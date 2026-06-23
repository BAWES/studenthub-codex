"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { TicketItem } from "../schemas";
import { updateTicketStatus } from "../actions";

type Props = {
  session: SessionUser;
  tickets: TicketItem[];
};

const STATUS_LABELS: Record<number, string> = {
  0: "Open",
  1: "In Progress",
  2: "Resolved",
  3: "Closed",
};

const STATUS_CLASSES: Record<number, string> = {
  0: "data-[status=0]:bg-blue/10 data-[status=0]:text-blue data-[status=0]:[&_.dot]:bg-blue",
  1: "data-[status=1]:bg-warning/10 data-[status=1]:text-warning data-[status=1]:[&_.dot]:bg-warning",
  2: "data-[status=2]:bg-success/10 data-[status=2]:text-success data-[status=2]:[&_.dot]:bg-success",
  3: "data-[status=3]:bg-muted/10 data-[status=3]:text-muted-foreground data-[status=3]:[&_.dot]:bg-muted-foreground",
};

function nextStatus(current: number | null): number {
  if (current === null) return 0;
  if (current >= 3) return 0;
  return current + 1;
}

export function AdminTicketsTable({ session, tickets }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const toggleStatus = useCallback(
    async (row: TicketItem) => {
      setError(null);
      const newStatus = nextStatus(row.ticket_status);
      try {
        const result = await updateTicketStatus(row.ticket_uuid, newStatus);
        if (result.operation === "error") {
          setError(result.message);
          return;
        }
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update ticket status",
        );
      }
    },
    [router],
  );

  const openCount = tickets.filter((t) => t.ticket_status === 0).length;
  const resolvedCount = tickets.filter((t) => t.ticket_status === 2).length;

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Manage tickets — support and issue tracking."
      metrics={[
        {
          label: "Total tickets",
          value: tickets.length,
          note: "Tickets in the system",
        },
        { label: "Open", value: openCount, note: "Awaiting response" },
        {
          label: "Resolved",
          value: resolvedCount,
          note: `${tickets.length - openCount - resolvedCount} in progress / closed`,
        },
      ]}
    >
      {error ? (
        <div
          className="mb-4 rounded-lg border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}

      <DataTable
        title="Tickets"
        description="All support tickets. Click status to cycle through Open → In Progress → Resolved → Closed."
        searchable={true}
        rows={tickets.map((t) => ({ ...t, id: t.ticket_uuid }))}
        rowHref={undefined}
        columns={[
          {
            key: "ticket_uuid",
            label: "UUID",
            render: (row) => (
              <span
                className="text-sm font-mono text-muted-foreground"
              >
                {row.ticket_uuid.slice(0, 8)}...
              </span>
            ),
          },
          {
            key: "ticket_detail",
            label: "Detail",
            render: (row) => (
              <span className="text-sm text-foreground">
                {row.ticket_detail ?? "—"}
              </span>
            ),
          },
          {
            key: "candidate_name",
            label: "Candidate",
            render: (row) => (
              <span className="text-sm text-foreground">
                {row.candidate_name ?? "—"}
              </span>
            ),
          },
          {
            key: "staff_name",
            label: "Staff",
            render: (row) => (
              <span className="text-sm text-foreground">
                {row.staff_name ?? "—"}
              </span>
            ),
          },
          {
            key: "created_at",
            label: "Created",
            render: (row) => {
              const d = row.created_at ? new Date(row.created_at) : null;
              return (
                <span className="text-sm text-foreground">
                  {d ? d.toLocaleDateString() : "—"}
                </span>
              );
            },
          },
          {
            key: "ticket_status",
            label: "Status",
            render: (row) => {
              const status = row.ticket_status ?? 0;
              const cls = STATUS_CLASSES[status] ?? STATUS_CLASSES[0];
              return (
                <button
                  type="button"
                  onClick={() => toggleStatus(row)}
                  data-status={status}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 hover:opacity-80 ${cls}`}
                >
                  <span
                    className="dot inline-block w-1.5 h-1.5 rounded-full"
                  />
                  {STATUS_LABELS[status] ?? `Status ${status}`}
                </button>
              );
            },
          },
        ]}
      />
    </WorkspaceShell>
  );
}
