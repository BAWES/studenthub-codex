import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { formatDate } from "@/modules/workspace/format";
import { getTag } from "@/modules/admin/tag/actions";
import { TagDetailForm } from "./TagDetailForm";

export const dynamic = "force-dynamic";

export default async function AdminTagDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.system");
  const { id } = await params;

  const tagId = Number(id);
  const tag = await getTag(tagId);
  if (!tag) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Tags"
      title={tag.tag}
      metrics={[
        { label: "Created", value: tag.created_at ? formatDate(new Date(tag.created_at)) : "—", note: "Record created" },
        { label: "Updated", value: tag.updated_at ? formatDate(new Date(tag.updated_at)) : "—", note: "Last updated" },
      ]}
    >
      <TagDetailForm tag={tag} />
    </WorkspaceShell>
  );
}
