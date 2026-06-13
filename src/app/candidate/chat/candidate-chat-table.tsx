"use client";

import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SessionUser } from "@/modules/auth/types";
import { formatDate } from "@/modules/workspace/format";

type Row = {
  id: string;
  company_id: number;
  store_id: number;
  staff_id: number | null;
  created_at: string;
};

type Props = {
  session: SessionUser;
  rows: Row[];
};

export function CandidateChatTable({ session, rows }: Props) {
  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate"
      title="Chat"
      metrics={[
        { label: "Total", value: rows.length, note: "Chat conversations" },
      ]}
    >
      <DataTable
        title="Conversations"
        description="Your chat conversations with companies and staff."
        rows={rows}
        rowHref="/candidate/chat/"
        columns={[
          {
            key: "chat_uuid",
            label: "Chat ID",
            render: (row) => (
              <span
                className="text-sm font-mono"
                style={{ color: "var(--muted)" }}
              >
                {row.id.slice(0, 8)}...
              </span>
            ),
          },
          {
            key: "company_id",
            label: "Company",
            render: (row) => (
              <span className="text-sm" style={{ color: "var(--ink)" }}>
                #{row.company_id}
              </span>
            ),
          },
          {
            key: "store_id",
            label: "Store",
            render: (row) => (
              <span className="text-sm" style={{ color: "var(--ink)" }}>
                #{row.store_id}
              </span>
            ),
          },
          {
            key: "staff_id",
            label: "Staff",
            render: (row) => (
              <span className="text-sm" style={{ color: "var(--ink)" }}>
                {row.staff_id != null ? `#${row.staff_id}` : "—"}
              </span>
            ),
          },
          {
            key: "created_at",
            label: "Started",
            render: (row) => (
              <span className="text-sm" style={{ color: "var(--muted)" }}>
                {row.created_at ?? "—"}
              </span>
            ),
          },
        ]}
      />
    </WorkspaceShell>
  );
}
