import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getDocumentDetail } from "../actions";

export const dynamic = "force-dynamic";

const DOCUMENT_DISPLAY: Record<string, { label: string; description: string }> = {
  photo: { label: "Personal Photo", description: "Your profile photograph for your candidate account." },
  cv: { label: "CV / Resume", description: "Curriculum vitae or resume document (PDF, DOC, DOCX)." },
  video: { label: "Video Profile", description: "Introductory video profile (MP4, WebM, MOV)." },
  civilFront: { label: "Civil ID (Front)", description: "Front side of your Kuwait Civil ID." },
  civilBack: { label: "Civil ID (Back)", description: "Back side of your Kuwait Civil ID." },
};

export default async function CandidateDocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const { id } = await params;
  const doc = await getDocumentDetail(id);

  if (!doc || !doc.type) {
    notFound();
  }

  const display = DOCUMENT_DISPLAY[id as keyof typeof DOCUMENT_DISPLAY] ?? {
    label: id,
    description: "Document",
  };

  const fileInfo = doc.filePath ? (
    <a href={doc.filePath} target="_blank" rel="noreferrer" className="documentViewLink">
      {doc.filePath.split("/").pop()}
    </a>
  ) : (
    "No file uploaded."
  );

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate / Documents"
      title={display.label}
      metrics={[]}
    >
      <DetailSection
        title="Document Details"
        facts={[
          { label: "Type", value: display.label },
          { label: "Description", value: display.description },
          { label: "Status", value: doc.filePath ? "Uploaded" : "Not uploaded" },
          { label: "File", value: fileInfo },
          { label: "DB Field", value: doc.field },
        ]}
      />
    </WorkspaceShell>
  );
}
