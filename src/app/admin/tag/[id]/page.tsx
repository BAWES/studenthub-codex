import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { FactPanel } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { getTag } from "@/modules/admin/tag/actions";

export const dynamic = "force-dynamic";

export default async function AdminTagDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.system");
  const { id } = await params;
  const tagId = Number(id);

  if (Number.isNaN(tagId)) {
    notFound();
  }

  const tag = await getTag(tagId);

  if (!tag) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Tags"
      title={`Tag — ${tag.tag}`}
      metrics={[
        {
          label: "Tag Name",
          value: tag.tag,
          note: "Tag name",
        },
      ]}
    >
      <FactPanel
        title="Tag Details"
        facts={[
          { label: "ID", value: String(tag.tag_id) },
          { label: "Tag Name", value: tag.tag },
          {
            label: "Created At",
            value: tag.created_at
              ? new Date(tag.created_at).toLocaleString()
              : "—",
          },
          {
            label: "Updated At",
            value: tag.updated_at
              ? new Date(tag.updated_at).toLocaleString()
              : "—",
          },
        ]}
      />

      <section className="flex gap-2 p-4">
        <Link href={"/admin/tag" as Route}>
          <Button variant="outline">Back to Tags</Button>
        </Link>
      </section>
    </WorkspaceShell>
  );
}
