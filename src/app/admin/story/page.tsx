import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { listStories } from "@/modules/admin/story/actions";

export const dynamic = "force-dynamic";

export default async function AdminStoryPage() {
  const session = await requireRoleCapability("admin", "admin.system");
  const { stories } = await listStories({ limit: 200 });

  const rows = stories.map((s) => ({
    id: s.story_uuid,
    request_position_title: s.request_position_title ?? "—",
    staff_name: s.staff_name ?? "—",
    number_of_employees: s.number_of_employees ?? 0,
    story_status: s.story_status,
    is_old: s.is_old,
    story_time_spent: s.story_time_spent,
    story_last_updated_at: s.story_last_updated_at
      ? new Date(s.story_last_updated_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—",
  }));

  const statusLabel = (status: number) => {
    switch (status) {
      case 0: return "Open";
      case 1: return "In Progress";
      case 2: return "Completed";
      default: return `Status ${status}`;
    }
  };

  return (
    <WorkspaceShell session={session} eyebrow="Admin" title="Stories" metrics={[]}>
      <DataTable
        title="Stories"
        description="Manage placement stories across the platform"
        rows={rows}
        rowHref={(row) => `/admin/story/${row.id}` as Route}
        columns={[
          { key: "request_position_title", label: "Position", render: (row) => <strong>{row.request_position_title}</strong> },
          { key: "staff_name", label: "Staff", render: (row) => row.staff_name },
          { key: "number_of_employees", label: "Employees", render: (row) => row.number_of_employees },
          {
            key: "story_status",
            label: "Status",
            render: (row) => statusLabel(row.story_status),
          },
          { key: "story_time_spent", label: "Time Spent", render: (row) => row.story_time_spent != null ? `${row.story_time_spent}m` : "—" },
          { key: "story_last_updated_at", label: "Updated", render: (row) => row.story_last_updated_at },
        ]}
      />
    </WorkspaceShell>
  );
}
