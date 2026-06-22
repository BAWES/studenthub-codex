import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/modules/workspace/format";
import { getMajorDetail } from "../actions";
import { MajorDetailForm } from "./MajorDetailForm";

export const dynamic = "force-dynamic";

export default async function AdminMajorDetailPage({
  params
}: {
  params: Promise<{ majorUuid: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.system");
  const { majorUuid } = await params;

  const major = await getMajorDetail(majorUuid);
  if (!major) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Majors"
      title={major.major_name_en}
      metrics={[
        { label: "Created", value: formatDate(major.major_created_at), note: "Record created" },
        { label: "Updated", value: formatDate(major.major_updated_at), note: "Last modified" }
      ]}
    >
      <MajorDetailForm major={major} />

      <section className="flex gap-2 p-4">
        <Link href={"/admin/major" as Route}>
          <Button variant="outline">Back to Majors</Button>
        </Link>
      </section>
    </WorkspaceShell>
  );
}
