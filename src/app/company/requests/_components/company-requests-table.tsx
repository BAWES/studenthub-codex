"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SessionUser } from "@/modules/auth/types";
import type { ReactNode } from "react";

type Row = {
  id: string;
  title: string;
  company: string;
  owner: string;
  seats: number;
  status: string;
  updated: string;
};

type Props = {
  session: SessionUser;
  rows: Row[];
};

const STATUS_COLORS: Record<string, string> = {
  pending: "var(--sh-warning)",
  started: "var(--sh-info)",
  delivered: "var(--sh-success)",
  cancelled: "var(--sh-error)",
};
const FALLBACK_BG = "var(--surface)";
const FALLBACK_COLOR = "var(--muted)";

function statusBadge(status: string) {
  const color = STATUS_COLORS[status] ?? FALLBACK_COLOR;
  const bg = STATUS_COLORS[status]
    ? `color-mix(in srgb, ${color} 15%, transparent)`
    : FALLBACK_BG;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.125rem 0.625rem",
        borderRadius: "9999px",
        fontSize: "0.75rem",
        fontWeight: 600,
        color,
        background: bg,
        textTransform: "capitalize",
      }}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function CompanyRequestsTable({ session, rows }: Props) {
  return (
    <WorkspaceShell session={session} eyebrow="Company" title="Requests" metrics={[]}>
      <div style={{ marginBottom: "1rem" }}>
        <Link
          href="/company/requests/create"
          className={cn(
            buttonVariants({ variant: "default" }),
            "inline-flex items-center gap-2",
          )}
        >
          <Plus className="size-4" />
          New Request
        </Link>
      </div>
      <DataTable
        title="Hiring Requests"
        description="Requests across the company accounts linked to this contact."
        rows={rows}
        rowHref="/company/requests/"
        columns={[
          { key: "title", label: "Request", render: (row) => <strong>{row.title}</strong> },
          { key: "company", label: "Company", render: (row) => row.company },
          { key: "owner", label: "Owner", render: (row) => row.owner },
          { key: "seats", label: "Seats", render: (row) => row.seats },
          {
            key: "status",
            label: "Status",
            render: (row) => statusBadge(row.status),
          },
          { key: "updated", label: "Updated", render: (row) => row.updated }
        ]}
      />
    </WorkspaceShell>
  );
}
