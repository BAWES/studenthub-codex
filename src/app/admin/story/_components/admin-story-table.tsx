"use client";

import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { StoryItem } from "@/modules/admin/story/schemas";

type Props = {
  session: SessionUser;
  stories: StoryItem[];
};

export function AdminStoryTable({ session, stories }: Props) {
  const router = useRouter();

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Stories — candidate stories and request progress."
      metrics={[
        { label: "Total stories", value: stories.length, note: "Story records in the system" },
      ]}
    >
      <DataTable
        title="Stories"
        description="All story records. Click a row to view details."
        rows={stories.map((s) => ({ ...s, id: s.story_uuid }))}
        rowHref={undefined}
        columns={[
          {
            key: "request_position_title",
            label: "Position",
            render: (row) => (
              <span className="text-sm font-medium" style={{ color: "var(--sh-primary)" }}>
                {row.request_position_title ?? "—"}
              </span>
            ),
          },
          {
            key: "staff_name",
            label: "Staff",
            render: (row) => (
              <span className="text-sm" style={{ color: "var(--ink)" }}>
                {row.staff_name ?? "—"}
              </span>
            ),
          },
          {
            key: "number_of_employees",
            label: "Employees",
            render: (row) => (
              <span className="text-sm" style={{ color: "var(--muted)" }}>
                {row.number_of_employees ?? "—"}
              </span>
            ),
          },
          {
            key: "story_status",
            label: "Status",
            render: (row) => (
              <span className="text-sm" style={{ color: "var(--muted)" }}>
                {row.story_status === 1 ? "Active" : row.story_status === 0 ? "Inactive" : String(row.story_status)}
              </span>
            ),
          },
          {
            key: "story_last_updated_at",
            label: "Last Updated",
            render: (row) => (
              <span className="text-sm" style={{ color: "var(--muted)" }}>
                {row.story_last_updated_at ? new Date(row.story_last_updated_at).toLocaleDateString() : "—"}
              </span>
            ),
          },
        ]}
      />
    </WorkspaceShell>
  );
}
