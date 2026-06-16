"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { NoteItem } from "../schemas";

type Props = {
  session: SessionUser;
  notes: NoteItem[];
};

export function AdminNotesTable({ session, notes }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Manage notes — internal notes across requests, companies, and stories."
      metrics={[
        {
          label: "Total notes",
          value: notes.length,
          note: "Notes loaded",
        },
      ]}
    >
      {error ? (
        <div
          className="mb-4 rounded-lg border px-4 py-3 text-sm"
          style={{
            borderColor: "var(--sh-error)",
            color: "var(--sh-error)",
            background: "var(--surface)",
          }}
        >
          {error}
        </div>
      ) : null}

      <DataTable
        title="Notes"
        description="Internal notes logged across the system."
        rows={notes.map((n) => ({ ...n, id: n.note_uuid }))}
        rowHref={undefined}
        columns={[
          {
            key: "note_uuid",
            label: "UUID",
            render: (row) => (
              <span
                className="text-sm font-mono"
                style={{ color: "var(--muted)" }}
              >
                {row.note_uuid.slice(0, 8)}...
              </span>
            ),
          },
          {
            key: "note_type",
            label: "Type",
            render: (row) => (
              <span
                className="text-sm"
                style={{ color: "var(--ink)" }}
              >
                {row.note_type ?? "—"}
              </span>
            ),
          },
          {
            key: "note_text",
            label: "Note",
            render: (row) => (
              <span
                className="text-sm truncate max-w-xs inline-block"
                style={{ color: "var(--ink)" }}
                title={row.note_text ?? undefined}
              >
                {row.note_text
                  ? row.note_text.length > 80
                    ? `${row.note_text.slice(0, 80)}...`
                    : row.note_text
                  : "—"}
              </span>
            ),
          },
          {
            key: "staff_created",
            label: "Created by",
            render: (row) => (
              <span
                className="text-sm"
                style={{ color: "var(--ink)" }}
              >
                {row.staff_created?.staff_name ?? "—"}
              </span>
            ),
          },
          {
            key: "note_created_datetime",
            label: "Created",
            render: (row) => {
              const d = row.note_created_datetime
                ? new Date(row.note_created_datetime)
                : null;
              return (
                <span
                  className="text-sm"
                  style={{ color: "var(--ink)" }}
                >
                  {d ? d.toLocaleDateString() : "—"}
                </span>
              );
            },
          },
          {
            key: "company_id",
            label: "Company",
            render: (row) => (
              <span
                className="text-sm"
                style={{ color: "var(--muted)" }}
              >
                {row.company_id ? `#${row.company_id}` : "—"}
              </span>
            ),
          },
        ]}
      />
    </WorkspaceShell>
  );
}
