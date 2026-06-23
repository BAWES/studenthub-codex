"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

const STATUS_VARIANTS: Record<string, "success" | "warning" | "secondary" | "outline"> = {
  pending: "warning",
  started: "secondary",
  delivered: "success",
  cancelled: "outline",
};

function statusBadge(status: string) {
  const variant = STATUS_VARIANTS[status] ?? "secondary";
  return (
    <Badge variant={variant} className="capitalize">
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

export function CompanyRequestsTable({ session, rows }: Props) {
  return (
    <WorkspaceShell session={session} eyebrow="Company" title="Requests" metrics={[]}>
      <div className="mb-4">
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
