"use client";

import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { SettingItem } from "../schemas";

type Props = {
  session: SessionUser;
  settings: SettingItem[];
};

export function AdminSettingsTable({ session, settings }: Props) {
  const router = useRouter();

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="System Settings — application configuration key-value pairs."
      metrics={[
        { label: "Total settings", value: settings.length, note: "Configuration entries in the system" },
      ]}
    >
      <DataTable
        title="System Settings"
        description="All application configuration settings."
        rows={settings.map((s) => ({ ...s, id: s.setting_uuid }))}
        rowHref={undefined}
        columns={[
          {
            key: "code",
            label: "Code",
            render: (row) => (
              <span className="text-sm text-foreground">
                {row.code ?? "—"}
              </span>
            ),
          },
          {
            key: "key",
            label: "Key",
            render: (row) => (
              <span className="text-sm text-foreground">
                {row.key ?? "—"}
              </span>
            ),
          },
          {
            key: "value",
            label: "Value",
            render: (row) => (
              <span className="text-sm max-w-[300px] truncate block text-foreground">
                {row.value ?? "—"}
              </span>
            ),
          },
          {
            key: "serialized",
            label: "Serialized",
            render: (row) => (
              <span className="text-sm text-muted-foreground">
                {row.serialized === true ? "Yes" : row.serialized === false ? "No" : "—"}
              </span>
            ),
          },
          {
            key: "updated_at",
            label: "Updated",
            render: (row) => (
              <span className="text-sm text-muted-foreground">
                {row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "—"}
              </span>
            ),
          },
        ]}
      />
    </WorkspaceShell>
  );
}
