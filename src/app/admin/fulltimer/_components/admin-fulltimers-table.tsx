"use client";

import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { FulltimerListItem } from "../schemas";

type Props = {
  session: SessionUser;
  fulltimers: FulltimerListItem[];
};

export function AdminFulltimersTable({ session, fulltimers }: Props) {
  const router = useRouter();

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Fulltimers — registered full-time job seekers."
      metrics={[
        { label: "Total fulltimers", value: fulltimers.length, note: "Full-time seekers in the system" },
      ]}
    >
      <DataTable
        title="Fulltimers"
        description="All registered full-time job seekers. Click a name to view details."
        searchable={true}
        rows={fulltimers.map((f) => ({ ...f, id: f.fulltimer_uuid }))}
        rowHref={undefined}
        columns={[
          {
            key: "fulltimer_name",
            label: "Name",
            render: (row) => (
              <span className="text-sm font-medium text-primary">
                {row.fulltimer_name}
              </span>
            ),
          },
          {
            key: "fulltimer_email",
            label: "Email",
            render: (row) => (
              <span className="text-sm text-foreground">
                {row.fulltimer_email}
              </span>
            ),
          },
          {
            key: "fulltimer_phone",
            label: "Phone",
            render: (row) => (
              <span className="text-sm text-muted-foreground">
                {row.fulltimer_phone ?? "—"}
              </span>
            ),
          },
          {
            key: "fulltimer_employed",
            label: "Employed",
            render: (row) => (
              <span className="text-sm text-muted-foreground">
                {row.fulltimer_employed === true ? "Yes" : row.fulltimer_employed === false ? "No" : "—"}
              </span>
            ),
          },
        ]}
      />
    </WorkspaceShell>
  );
}
