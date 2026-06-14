import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getNoteEntry } from "./actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function CompanyNoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRoleCapability("company", "company.read.linked");
  const { id } = await params;
  const note = await getNoteEntry(id);

  if (!note) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Company / Note"
      title={note.note_type ?? "Note"}
      metrics={[]}
    >
      <DetailSection
        title="Note Details"
        facts={[
          { label: "Type", value: note.note_type ?? "—" },
          { label: "Content", value: note.note_text ?? "—" },
          { label: "Created by", value: note.staff_created?.staff_name ?? "—" },
          { label: "Updated by", value: note.staff_updated?.staff_name ?? "—" },
          { label: "Created", value: formatDate(note.note_created_datetime) },
          { label: "Updated", value: formatDate(note.note_updated_datetime) },
        ]}
      />
    </WorkspaceShell>
  );
}
