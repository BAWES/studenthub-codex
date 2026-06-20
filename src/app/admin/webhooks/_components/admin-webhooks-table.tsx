"use client";

import { useActionState, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { WebhookListItem } from "../schemas";

type Props = {
  session: SessionUser;
  webhooks: WebhookListItem[];
};

export function AdminWebhooksTable({ session, webhooks }: Props) {
  const router = useRouter();

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Manage webhooks — configure HTTP callbacks for system events across the platform."
      metrics={[
        { label: "Total webhooks", value: webhooks.length, note: "Registered webhook endpoints" },
      ]}
    >
      <DataTable
        title="Webhooks"
        description="All configured webhooks. Click a row to view details."
        rows={webhooks.map((w) => ({ ...w, id: w.webhook_id }))}
        rowHref="/admin/webhooks"
        columns={[
          {
            key: "event",
            label: "Event",
            render: (row) => (
              <span className="text-sm font-mono">{row.event}</span>
            ),
          },
          {
            key: "endpoint",
            label: "Endpoint",
            render: (row) => (
              <span className="text-sm truncate max-w-[400px] inline-block align-middle" title={row.endpoint}>
                {row.endpoint}
              </span>
            ),
          },
          {
            key: "method",
            label: "Method",
            render: (row) =>
              row.method ? (
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold text-white ${
                  row.method === "POST"
                    ? "bg-[var(--sh-primary)]"
                    : row.method === "GET"
                      ? "bg-[var(--sh-info)]"
                      : "bg-[var(--sh-warning)]"
                }`}
                >
                  {row.method}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              ),
          },
          {
            key: "updated",
            label: "Last updated",
            render: (row) => {
              if (!row.updated_at) return "—";
              return new Date(row.updated_at).toLocaleDateString();
            },
          },
          {
            key: "created",
            label: "Created",
            render: (row) => {
              if (!row.created_at) return "—";
              return new Date(row.created_at).toLocaleDateString();
            },
          },
        ]}
      />
    </WorkspaceShell>
  );
}
