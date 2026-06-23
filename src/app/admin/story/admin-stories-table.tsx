"use client";

import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";

type StoryRecord = {
  story_uuid: string;
  request_uuid: string;
  suggestion_uuid: string | null;
  staff_id: number | null;
  number_of_employees: number | null;
  story_status: number;
  is_old: boolean | null;
  story_time_spent: number | null;
  story_created_at: Date | null;
  story_last_updated_at: Date | null;
  staff: { staff_name: string } | null;
  request: {
    request_position_title: string | null;
    company: { company_name: string } | null;
  } | null;
};

type Props = {
  session: SessionUser;
  records: StoryRecord[];
};

function StatusBadge({ status }: { status: number }) {
  const statusMap: Record<number, { label: string; variant: "default" | "secondary" | "success" | "warning" | "outline" }> = {
    0: { label: "Pending", variant: "secondary" },
    1: { label: "Active", variant: "success" },
    2: { label: "Completed", variant: "default" },
    3: { label: "Cancelled", variant: "warning" },
  };
  const config = statusMap[status] ?? { label: `Status ${status}`, variant: "outline" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function AdminStoriesTable({ session, records }: Props) {
  const router = useRouter();

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Stories — manage placement stories across the platform."
      metrics={[
        { label: "Total stories", value: records.length, note: "Placement story records" },
      ]}
    >
      <DataTable
        title="Stories"
        description="All story records. Click a row to view details."
        searchable={true}
        rows={records.map((r) => ({ ...r, id: r.story_uuid }))}
        rowHref={(row) => `/admin/story/${row.story_uuid}` as Route}
        columns={[
          {
            key: "position",
            label: "Position",
            render: (row) => (
              <span className="text-sm font-medium">
                {row.request?.request_position_title ?? "(no position)"}
              </span>
            ),
          },
          {
            key: "company",
            label: "Company",
            render: (row) => (
              <span className="text-sm truncate max-w-[200px] inline-block align-middle" title={row.request?.company?.company_name ?? undefined}>
                {row.request?.company?.company_name ?? "—"}
              </span>
            ),
          },
          {
            key: "staff_name",
            label: "Assigned To",
            render: (row) => (
              <span className="text-sm">
                {row.staff?.staff_name ?? "Unassigned"}
              </span>
            ),
          },
          {
            key: "num_employees",
            label: "Employees",
            render: (row) => (
              <span className="text-sm">{row.number_of_employees ?? "—"}</span>
            ),
          },
          {
            key: "story_status",
            label: "Status",
            render: (row) => <StatusBadge status={row.story_status} />,
          },
          {
            key: "is_old",
            label: "Type",
            render: (row) =>
              row.is_old ? (
                <Badge variant="warning">Legacy</Badge>
              ) : (
                <Badge variant="secondary">Current</Badge>
              ),
          },
          {
            key: "created",
            label: "Created",
            render: (row) => {
              if (!row.story_created_at) return "—";
              return new Date(row.story_created_at).toLocaleDateString();
            },
          },
        ]}
      />
    </WorkspaceShell>
  );
}
