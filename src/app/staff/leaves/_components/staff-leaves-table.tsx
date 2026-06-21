"use client";

import { DataTablePage } from "@/modules/workspace/DataTablePage";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { genericStatusVariant } from "@/modules/workspace/status-mapping";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SessionUser } from "@/modules/auth/types";

type LeaveRow = {
  id: string;
  staff_leave_uuid: string;
  staff_id: number | null;
  staff_name: string | null;
  from_date: string | null;
  to_date: string | null;
  note: string | null;
  category: string | null;
  status: number | null;
  created_at: string | null;
  updated_at: string | null;
};

type Props = {
  session: SessionUser;
  rows: LeaveRow[];
};

const STATUS_LABELS: Record<number, string> = {
  0: "pending",
  1: "approved",
  2: "rejected",
  3: "cancelled",
};

function getStatusLabel(status: number | null): string {
  if (status === null) return "unknown";
  return STATUS_LABELS[status] ?? `unknown (${status})`;
}

function formatDate(d: string | null): string {
  if (!d) return "—";
  const date = new Date(d);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function StaffLeavesTable({ session, rows }: Props) {
  return (
    <WorkspaceShell session={session} eyebrow="Staff" title="Leaves" metrics={[]}>
      <DataTablePage
        title="Staff Leave Records"
        description="Manage and review staff leave requests — annual, sick, and personal leave."
        rows={rows}
        rowHref="/staff/leaves/"
        searchable
        searchPlaceholder="Search by staff name, category, or note..."
        columns={[
          {
            key: "staff_name",
            label: "Staff",
            render: (row) => row.staff_name ?? "—",
          },
          {
            key: "category",
            label: "Category",
            render: (row) => {
              const cat = row.category ?? "—";
              return (
                <span className="capitalize">{String(cat).replace(/_/g, " ")}</span>
              );
            },
          },
          {
            key: "from_date",
            label: "From",
            render: (row) => formatDate(row.from_date),
          },
          {
            key: "to_date",
            label: "To",
            render: (row) => formatDate(row.to_date),
          },
          {
            key: "status",
            label: "Status",
            render: (row) => {
              const label = getStatusLabel(row.status);
              return (
                <StatusBadge
                  variant={genericStatusVariant(label)}
                  label={label.charAt(0).toUpperCase() + label.slice(1)}
                  size="sm"
                />
              );
            },
          },
          {
            key: "note",
            label: "Note",
            render: (row) => row.note ?? "—",
          },
          {
            key: "created_at",
            label: "Created",
            render: (row) => formatDate(row.created_at),
          },
        ]}
      />
    </WorkspaceShell>
  );
}
