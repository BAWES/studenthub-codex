import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { listEvents } from "@/modules/admin/event/actions";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

export const dynamic = "force-dynamic";

export default async function AdminEventPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const { events } = await listEvents({ limit: 100 });

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Activity Events — request activity and audit trail."
      metrics={[
        {
          label: "Total events",
          value: events.length,
          note: "Request activity events loaded",
        },
      ]}
    >
      <DataTable
        title="Events"
        description="Request activity events. Click a row to view event details."
        rows={events.map((e) => ({ ...e, id: e.activity_uuid }))}
        rowHref={(row) => `/admin/event/${row.activity_uuid}` as Route}
        columns={[
          {
            key: "activity_uuid",
            label: "UUID",
            render: (row) => (
              <span className="text-sm font-mono text-muted-foreground">
                {row.activity_uuid.slice(0, 8)}...
              </span>
            ),
          },
          {
            key: "request_uuid",
            label: "Request UUID",
            render: (row) => (
              <span className="text-sm font-mono text-muted-foreground">
                {row.request_uuid.slice(0, 8)}...
              </span>
            ),
          },
          {
            key: "activity_detail",
            label: "Detail",
            render: (row) => (
              <span className="text-sm text-foreground">
                {row.activity_detail ?? "—"}
              </span>
            ),
          },
          {
            key: "staff_name",
            label: "Staff",
            render: (row) => (
              <span className="text-sm text-foreground">
                {row.staff_name ?? "—"}
              </span>
            ),
          },
          {
            key: "activity_created_datetime",
            label: "Created",
            render: (row) => {
              const d = row.activity_created_datetime
                ? new Date(row.activity_created_datetime)
                : null;
              return (
                <span className="text-sm text-foreground">
                  {d ? d.toLocaleDateString() : "—"}
                </span>
              );
            },
          },
        ]}
      />
    </WorkspaceShell>
  );
}
