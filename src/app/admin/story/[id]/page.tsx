import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { formatDate } from "@/modules/workspace/format";
import { getStoryDetail } from "@/modules/admin/story/actions";
import { StoryDetailForm } from "./StoryDetailForm";

export const dynamic = "force-dynamic";

export default async function AdminStoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.system");
  const { id } = await params;

  const story = await getStoryDetail(id);
  if (!story) {
    notFound();
  }

  const statusLabel = (status: number) => {
    switch (status) {
      case 0: return "Open";
      case 1: return "In Progress";
      case 2: return "Completed";
      default: return `Status ${status}`;
    }
  };

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Story"
      title={story.request_position_title ?? "Untitled Story"}
      metrics={[
        {
          label: "Status",
          value: statusLabel(story.story_status),
          note: "Current status",
        },
        {
          label: "Updated",
          value: story.story_last_updated_at
            ? formatDate(new Date(story.story_last_updated_at))
            : "Not set",
          note: "Last modified",
        },
      ]}
    >
      <StoryDetailForm story={story} />
    </WorkspaceShell>
  );
}
