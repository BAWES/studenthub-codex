import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { formatDate } from "@/modules/workspace/format";
import { getDegree, getDegreeGroupOptions } from "@/modules/admin/degree/actions";
import { DegreeDetailForm } from "./DegreeDetailForm";

export const dynamic = "force-dynamic";

export default async function AdminDegreeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.system");
  const { id } = await params;

  const degree = await getDegree(id);
  if (!degree) {
    notFound();
  }

  const groups = await getDegreeGroupOptions();

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Degree"
      title={degree.degree_name_en}
      metrics={[
        { label: "Sort", value: degree.degree_sort_order ?? "—", note: "Display order" },
        { label: "Group", value: degree.group_name_en ?? "—", note: "Degree group" },
      ]}
    >
      <DegreeDetailForm degree={degree} groups={groups} />
    </WorkspaceShell>
  );
}
