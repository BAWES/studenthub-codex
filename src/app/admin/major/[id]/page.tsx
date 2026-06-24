import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/modules/workspace/format";
import { getMajor } from "@/modules/admin/major/actions";
import { MajorDetailForm } from "./MajorDetailForm";

export const dynamic = "force-dynamic";

export default async function AdminMajorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.system");
  const { id } = await params;

  const result = await getMajor(id);
  if (!result.major) {
    notFound();
  }
  const { major } = result;

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Majors"
      title={major.major_name_en}
      metrics={[
        { label: "Created", value: major.major_created_at ? formatDate(new Date(major.major_created_at)) : "—", note: "Record created" },
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
