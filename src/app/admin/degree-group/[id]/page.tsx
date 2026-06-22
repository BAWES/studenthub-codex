import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { formatDate } from "@/modules/workspace/format";
import { getDegreeGroupDetail } from "../actions";
import { DegreeGroupDetailForm } from "./DegreeGroupDetailForm";

export const dynamic = "force-dynamic";

export default async function AdminDegreeGroupDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.system");
  const { id } = await params;

  const group = await getDegreeGroupDetail(id);
  if (!group) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Degree Group"
      title={group.degree_group_name_en}
      metrics={[
        { label: "Created", value: formatDate(group.degree_group_created_at), note: "Record created" },
        { label: "Updated", value: formatDate(group.degree_group_updated_at), note: "Last modified" }
      ]}
    >
      <DegreeGroupDetailForm group={group} />
    </WorkspaceShell>
  );
}
