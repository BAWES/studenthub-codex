"use client";

import { useRouter } from "next/navigation";
import type { Route } from "next";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Badge } from "@/components/ui/badge";

import type { SessionUser } from "@/modules/auth/types";
import type { FulltimerListItem } from "@/modules/fulltimers/schemas";

type Props = {
  session: SessionUser;
  records: FulltimerListItem[];
};

export function AdminFulltimersTable({ session, records }: Props) {
  const router = useRouter();

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Fulltimers — manage full-time candidate records."
      metrics={[
        { label: "Total candidates", value: records.length, note: "Fulltimer records" },
      ]}
    >
      <DataTable
        title="Fulltimers"
        description="All fulltimer candidates. Click a row to view details."
        rows={records.map((r) => ({ ...r, id: r.fulltimer_uuid }))}
        rowHref={(row) => `/admin/fulltimer/${row.fulltimer_uuid}` as Route}
        columns={[
          {
            key: "fulltimer_name",
            label: "Name",
            render: (row) => (
              <span className="text-sm font-medium">
                {row.fulltimer_name ?? "(no name)"}
              </span>
            ),
          },
          {
            key: "fulltimer_email",
            label: "Email",
            render: (row) => (
              <span className="text-sm truncate max-w-[250px] inline-block align-middle" title={row.fulltimer_email ?? undefined}>
                {row.fulltimer_email ?? "—"}
              </span>
            ),
          },
          {
            key: "fulltimer_phone",
            label: "Phone",
            render: (row) => (
              <span className="text-sm">{row.fulltimer_phone ?? "—"}</span>
            ),
          },
          {
            key: "fulltimer_employed",
            label: "Employed",
            render: (row) =>
              row.fulltimer_employed === true ? (
                <Badge variant="success">Yes</Badge>
              ) : row.fulltimer_employed === false ? (
                <Badge variant="secondary">No</Badge>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              ),
          },
          {
            key: "nationality_name",
            label: "Nationality",
            render: (row) => (
              <span className="text-sm">{row.nationality_name ?? "—"}</span>
            ),
          },
          {
            key: "fulltimer_current_salary",
            label: "Current Salary",
            render: (row) => (
              <span className="text-sm">{row.fulltimer_current_salary ?? "—"}</span>
            ),
          },
          {
            key: "university_name",
            label: "University",
            render: (row) => (
              <span className="text-sm truncate max-w-[200px] inline-block align-middle">
                {row.university_name ?? "—"}
              </span>
            ),
          },
          {
            key: "fulltimer_created_datetime",
            label: "Created",
            render: (row) => {
              if (!row.fulltimer_created_datetime) return "—";
              return new Date(row.fulltimer_created_datetime).toLocaleDateString();
            },
          },
        ]}
      />
    </WorkspaceShell>
  );
}
