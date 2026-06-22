import { requireRoleCapability } from "@/modules/auth/session";
import {
  listCandidateDocuments,
  uploadCandidateDocument,
  deleteCandidateDocument,
} from "@/modules/candidates/documents";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { DocumentsClient } from "./_components";

export const dynamic = "force-dynamic";

export default async function CandidateDocumentsPage() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const { items: documents } = await listCandidateDocuments({ candidateId });

  const metrics = [
    { label: "Documents", value: documents.filter((d) => d.filePath).length, note: "Uploaded" },
    { label: "Pending", value: documents.filter((d) => !d.filePath).length, note: "Not yet uploaded" },
    { label: "Total", value: documents.length, note: "Required documents" },
  ];

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate"
      title="Document Management"
      metrics={metrics}
    >
      <p className="mb-4 text-muted-foreground">
        Upload and manage your documents — personal photo, CV/resume, video
        profile, and civil ID photos. These documents are visible to companies
        reviewing your profile.
      </p>

      <DocumentsClient
        items={documents}
        uploadAction={uploadCandidateDocument}
        deleteAction={deleteCandidateDocument}
      />
    </WorkspaceShell>
  );
}
