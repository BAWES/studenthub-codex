import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getNote } from "./actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function AdminNoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { id } = await params;

  const note = await getNote({ id });

  if (!note) {
    notFound();
  }

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Notes"
        title={`Note ${note.note_uuid.slice(0, 8)}...`}
        metrics={[]}
      >
        <DetailSection
          title="Note Details"
          facts={[
            { label: "UUID", value: note.note_uuid },
            { label: "Type", value: note.note_type || "—" },
            { label: "Text", value: note.note_text || "—" },
            {
              label: "Company ID",
              value: note.company_id?.toString() ?? "—",
            },
            {
              label: "Created by",
              value: note.staff_created?.staff_name ?? note.created_by?.toString() ?? "—",
            },
            {
              label: "Created",
              value: note.note_created_datetime
                ? formatDate(new Date(note.note_created_datetime))
                : "—",
            },
            {
              label: "Updated",
              value: note.note_updated_datetime
                ? formatDate(new Date(note.note_updated_datetime))
                : "—",
            },
            ...(note.request_uuid
              ? [{ label: "Request UUID" as const, value: note.request_uuid }]
              : []),
            ...(note.story_uuid
              ? [{ label: "Story UUID" as const, value: note.story_uuid }]
              : []),
          ]}
        />
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
