"use client";

import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { AwsConfigEntry } from "./schemas";

type Props = {
  session: SessionUser;
  configs: AwsConfigEntry[];
};

export function AdminAwsTable({ session, configs }: Props) {
  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="AWS configuration — view environment-level cloud storage and region settings."
      metrics={[
        {
          label: "Config keys",
          value: configs.length,
          note: "Settings available in the environment",
        },
      ]}
    >
      <DataTable
        title="AWS Configuration"
        description="Current environment values for AWS-related settings. These are set in the server environment and are read-only."
        rows={configs.map((c) => ({ ...c, id: c.key }))}
        rowHref={undefined}
        columns={[
          {
            key: "key",
            label: "Config key",
            render: (row) => (
              <span className="font-mono text-sm" style={{ color: "var(--ink)" }}>
                {row.key}
              </span>
            ),
          },
          {
            key: "value",
            label: "Value",
            render: (row) => (
              <span className="text-sm" style={{ color: "var(--muted)" }}>
                {row.value || (
                  <span className="italic" style={{ color: "var(--muted)" }}>
                    Not set
                  </span>
                )}
              </span>
            ),
          },
        ]}
      />
    </WorkspaceShell>
  );
}
