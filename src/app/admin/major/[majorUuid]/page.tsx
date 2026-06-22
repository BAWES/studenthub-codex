import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
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
    </WorkspaceShell>
  );
}
