import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { formatDate } from "@/modules/workspace/format";
import { getStoryDetail } from "../actions";
import { StoryDetailForm } from "./StoryDetailForm";

export const dynamic = "force-dynamic";

export default async function AdminStoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRoleCapability("admin", "admin.system");
  const { id } = await params;

  const story = await getStoryDetail(id);
  if (!story) notFound();

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Stories"
      title={`Story ${story.story_uuid.slice(0, 8)}...`}
      metrics={[
        { label: "Status", value: String(story.story_status), note: "Current status" },
        { label: "Employees", value: String(story.number_of_employees ?? "-"), note: "Number of employees" },
        { label: "Created", value: formatDate(story.story_created_at), note: "Record created" },
        { label: "Updated", value: formatDate(story.story_last_updated_at), note: "Last modified" }
      ]}
    >
      <StoryDetailForm story={story} />
    </WorkspaceShell>
  );
}
