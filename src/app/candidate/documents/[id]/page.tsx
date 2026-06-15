import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { getCandidateDocument } from "./actions";

export const dynamic = "force-dynamic";

// Document type labels (mirrored from actions.ts — can't import from "use server" file)
const DOCUMENT_LABELS: Record<string, string> = {
  photo: "Personal Photo",
  cv: "CV / Resume",
  video: "Video Profile",
  civilFront: "Civil ID (Front)",
  civilBack: "Civil ID (Back)",
};

/** Returns a user-friendly description of the file based on MIME hints. */
function fileTypeDescription(documentType: string): string {
  switch (documentType) {
    case "photo":
    case "civilFront":
    case "civilBack":
      return "Image file (JPEG, PNG, WebP, or GIF)";
    case "cv":
      return "Document file (PDF or Word)";
    case "video":
      return "Video file (MP4, WebM, or MOV)";
    default:
      return "File";
  }
}

/** Returns the appropriate image for embedding in the page. */
function DocumentPreview({ document }: { document: { type: string; filePath: string | null; label: string } }) {
  if (!document.filePath) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border-2 border-dashed"
        style={{
          width: "100%",
          height: 200,
          borderColor: "var(--border)",
          background: "var(--surface)",
        }}
      >
        <span style={{ color: "var(--muted)" }}>Not uploaded yet</span>
      </div>
    );
  }

  // Show thumbnail for image types
  if (["photo", "civilFront", "civilBack"].includes(document.type)) {
    return (
      <div
        className="flex items-center justify-center rounded-lg overflow-hidden"
        style={{
          width: "100%",
          maxHeight: 400,
          background: "var(--surface)",
        }}
      >
        { }
        <img
          src={document.filePath}
          alt={document.label}
          style={{ maxWidth: "100%", maxHeight: 400, objectFit: "contain" }}
        />
      </div>
    );
  }

  return null;
}

export default async function CandidateDocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);
  const { id } = await params;

  // Validate the id is a known document type
  const VALID_TYPES = ["photo", "cv", "video", "civilFront", "civilBack"] as const;
  type ValidDocType = (typeof VALID_TYPES)[number];
  if (!(VALID_TYPES as readonly string[]).includes(id)) {
    notFound();
  }

  const document = await getCandidateDocument({ candidateId, documentType: id as ValidDocType });

  if (!document) {
    notFound();
  }

  const label = DOCUMENT_LABELS[id] ?? id;

  const metrics = [
    {
      label: "Status",
      value: document.filePath ? "Uploaded" : "Not Uploaded",
      note: document.filePath ? "File on disk" : "No file uploaded yet",
    },
    {
      label: "Type",
      value: label,
      note: fileTypeDescription(id),
    },
  ];

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Candidate / Documents"
        title={label}
        metrics={metrics}
      >
        <DetailSection
          title="Document Details"
          facts={[
            { label: "Type", value: label },
            {
              label: "Status",
              value: document.filePath ? "Uploaded" : "Not Uploaded",
            },
            {
              label: "File Path",
              value: document.filePath ?? "—",
            },
          ]}
        />

        <section style={{ padding: "1rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem", color: "var(--ink)" }}>
            Preview
          </h3>
          <DocumentPreview document={document} />
        </section>

        <section style={{ display: "flex", gap: "0.5rem", padding: "1rem" }}>
          <Link href={"/candidate/documents" as Route}>
            <Button variant="outline">Back to Documents</Button>
          </Link>
          {document.filePath && (
            <a href={document.filePath} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">Open File</Button>
            </a>
          )}
        </section>
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
