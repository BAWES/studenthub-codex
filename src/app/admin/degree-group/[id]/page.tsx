import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
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

  const degreeGroup = await getDegreeGroupDetail(id);
  if (!degreeGroup) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Degree Groups"
      title={degreeGroup.degree_group_name_en}
      metrics={[
        { label: "Created", value: formatDate(degreeGroup.degree_group_created_at), note: "Record created" },
        { label: "Updated", value: formatDate(degreeGroup.degree_group_updated_at), note: "Last modified" }
      ]}
    >
      <DegreeGroupDetailForm degreeGroup={degreeGroup} />

      <section className="flex gap-2 p-4">
        <Link href={"/admin/degree-group" as Route}>
          <Button variant="outline">Back to Degree Groups</Button>
        </Link>
      </section>
    </WorkspaceShell>
  );
}
