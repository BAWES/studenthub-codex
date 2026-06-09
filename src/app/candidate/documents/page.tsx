import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { listMyDocuments } from "./actions";
import { DocumentManager } from "./DocumentManager";

export const dynamic = "force-dynamic";

export default async function CandidateDocumentsPage() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const { items } = await listMyDocuments();

  const uploaded = items.filter((d) => d.filePath);
  const total = items.length;

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate"
      title="Documents"
      metrics={[
        {
          label: "Uploaded",
          value: `${uploaded.length} of ${total}`,
          note: "Documents on file",
        },
      ]}
    >
      <DocumentManager items={items} />
    </WorkspaceShell>
  );
}
