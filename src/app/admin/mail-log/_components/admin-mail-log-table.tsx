"use client";

import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { MailLogListItem } from "@/modules/mail-logs/schemas";

type Props = {
  session: SessionUser;
  records: MailLogListItem[];
};

export function AdminMailLogTable({ session, records }: Props) {
  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Mail log — view all outgoing emails sent by the system."
      metrics={[
        { label: "Total emails", value: records.length, note: "Mail log entries" },
      ]}
    >
      <DataTable
        title="Mail log"
        description="All outgoing emails. Read-only view of the system's email dispatch log."
        rows={records.map((r) => ({ ...r, id: r.mail_uuid }))}
        rowHref={undefined}
        columns={[
          {
            key: "mail_uuid",
            label: "UUID",
            render: (row) => (
              <span className="font-mono text-xs text-muted-foreground">
                {row.mail_uuid?.substring(0, 8) ?? "—"}…
              </span>
            ),
          },
          {
            key: "subject",
            label: "Subject",
            render: (row) => (
              <span className="text-sm font-medium text-foreground">
                {row.subject ?? "—"}
              </span>
            ),
          },
          {
            key: "from",
            label: "From",
            render: (row) => (
              <span className="text-sm text-foreground">
                {row.from ?? "—"}
              </span>
            ),
          },
          {
            key: "to",
            label: "To",
            render: (row) => (
              <span className="text-sm text-foreground">
                {row.to ?? "—"}
              </span>
            ),
          },
          {
            key: "app",
            label: "App",
            render: (row) => (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {row.app ?? "—"}
              </span>
            ),
          },
          {
            key: "created_at",
            label: "Sent at",
            render: (row) => {
              if (!row.created_at) return "—";
              return new Date(row.created_at).toLocaleString();
            },
          },
        ]}
      />
    </WorkspaceShell>
  );
}
