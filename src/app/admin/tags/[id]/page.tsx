import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getTag } from "./actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function AdminTagDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { id } = await params;
  const tagIdNum = Number(id);

  if (Number.isNaN(tagIdNum)) {
    notFound();
  }

  const data = await getTag({ tagId: tagIdNum });

  if (!data.tag) {
    notFound();
  }

  const tag = data.tag;

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Tags"
        title={tag.tag}
        metrics={[]}
      >
        <DetailSection
          title="Tag Details"
          facts={[
            { label: "Name", value: tag.tag },
            {
              label: "Created",
              value: tag.created_at
                ? formatDate(new Date(tag.created_at))
                : "—",
            },
            {
              label: "Updated",
              value: tag.updated_at
                ? formatDate(new Date(tag.updated_at))
                : "—",
            },
          ]}
        />
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
