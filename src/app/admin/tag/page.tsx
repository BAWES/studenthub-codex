import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { listTags } from "@/modules/admin/tag/actions";

export const dynamic = "force-dynamic";

export default async function AdminTagPage() {
  const session = await requireRoleCapability("admin", "admin.system");

  const { records, total } = await listTags({ page: 1, limit: 100 });

  const rows = records.map((r) => ({
    id: r.tag_id,
    tag: r.tag,
  }));

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin"
      title="Tags"
      metrics={[{ label: "Tags", value: total, note: "Active tags" }]}
    >
      <DataTable
        title="Tags"
        description="Manage tags used across candidates and companies"
        searchable={true}
        rows={rows}
        rowHref={(row) => `/admin/tag/${row.id}` as Route}
        columns={[
          { key: "tag", label: "Tag", render: (row) => <strong>{row.tag}</strong> },
        ]}
      />
    </WorkspaceShell>
  );
}
