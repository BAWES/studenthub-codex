import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { formatDate } from "@/modules/workspace/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type DegreeGroupRow = {
  id: string;
  name_en: string;
  name_ar: string;
  sort_order: number;
  degrees: number;
  updated: string;
};

export default async function AdminDegreeGroupPage() {
  const session = await requireRoleCapability("admin", "admin.system");

  const rows = await prisma.degree_group.findMany({
    orderBy: [
      { degree_group_sort_order: "asc" },
      { degree_group_name_en: "asc" },
    ],
    take: 100,
    select: {
      degree_group_uuid: true,
      degree_group_name_en: true,
      degree_group_name_ar: true,
      degree_group_sort_order: true,
      degree_group_updated_at: true,
      _count: { select: { degree: true } },
    },
  });

  const mapped: DegreeGroupRow[] = rows.map((r) => ({
    id: r.degree_group_uuid,
    name_en: r.degree_group_name_en,
    name_ar: r.degree_group_name_ar ?? "—",
    sort_order: r.degree_group_sort_order ?? 0,
    degrees: r._count.degree,
    updated: formatDate(r.degree_group_updated_at),
  }));

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin"
      title="Degree Groups"
      metrics={[{ label: "Groups", value: mapped.length, note: "Active degree groups" }]}
    >
      <DataTable
        title="Degree Groups"
        description="Manage degree group types used to categorize degrees"
        rows={mapped}
        rowHref={(row) => `/admin/degree-group/${row.id}` as Route}
        columns={[
          { key: "name_en", label: "Name (EN)", render: (row) => <strong>{row.name_en}</strong> },
          { key: "name_ar", label: "Name (AR)", render: (row) => row.name_ar },
          { key: "sort_order", label: "Sort", render: (row) => row.sort_order },
          { key: "degrees", label: "Degrees", render: (row) => row.degrees },
          { key: "updated", label: "Updated", render: (row) => row.updated },
        ]}
      />
    </WorkspaceShell>
  );
}
