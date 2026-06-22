import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/modules/workspace/format";
import { getUniversityDetail } from "../actions";
import { UniversityDetailForm } from "./UniversityDetailForm";

export const dynamic = "force-dynamic";

export default async function AdminUniversityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRoleCapability("admin", "admin.system");
  const { id } = await params;

  const university = await getUniversityDetail(Number(id));
  if (!university) notFound();

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Universities"
      title={university.university_name_en ?? "University"}
      metrics={[
        { label: "Created", value: formatDate(university.university_created_at), note: "Record created" },
        { label: "Updated", value: formatDate(university.university_updated_at), note: "Last modified" }
      ]}
    >
      <UniversityDetailForm university={university} />

      <section className="flex gap-2 p-4">
        <Link href={"/admin/university" as Route}>
          <Button variant="outline">Back to Universities</Button>
        </Link>
      </section>
    </WorkspaceShell>
  );
}
