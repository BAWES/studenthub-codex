import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { FactPanel } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { getAdminUniversityDetail } from "@/modules/workspace/data";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function AdminUniversityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.system");
  const { id } = await params;
  const universityId = Number(id);

  if (Number.isNaN(universityId)) {
    notFound();
  }

  const university = await getAdminUniversityDetail(universityId);

  if (!university) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Universities"
      title={`University — ${university.university_name_en ?? university.university_name_ar ?? "Unnamed"}`}
      metrics={[
        { label: "Created", value: formatDate(university.university_created_at), note: "Record created" },
        { label: "Updated", value: formatDate(university.university_updated_at), note: "Last modified" }
      ]}
    >
      <FactPanel
        title="University Details"
        facts={[
          { label: "ID", value: String(university.university_id) },
          { label: "Name (English)", value: university.university_name_en ?? "—" },
          { label: "Name (Arabic)", value: university.university_name_ar ?? "—" },
          { label: "Data Source", value: university.university_data_source != null ? String(university.university_data_source) : "—" },
        ]}
      />

      <section className="flex gap-2 p-4">
        <Link href={"/admin/university" as Route}>
          <Button variant="outline">Back to Universities</Button>
        </Link>
      </section>
    </WorkspaceShell>
  );
}
