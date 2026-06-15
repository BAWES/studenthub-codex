import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { getDocument } from "../actions";
import { DOCUMENT_TYPES } from "@/modules/candidates/documents/constants";
import type { DocumentType } from "@/modules/candidates/documents/constants";

export const dynamic = "force-dynamic";

export default async function CandidateDocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const { id } = await params;

  // Validate that the id is a known document type
  const documentType = id as DocumentType;
  if (!DOCUMENT_TYPES.includes(documentType)) {
    notFound();
  }

  const document = await getDocument(documentType);

  if (!document) {
    notFound();
  }

  const isUploaded = document.filePath !== null;

  const facts = [
    { label: "Document Type", value: document.label },
    {
      label: "Status",
      value: (
        <StatusBadge
          variant={isUploaded ? "active" : "pending"}
          label={isUploaded ? "Uploaded" : "Not Uploaded"}
          size="sm"
        />
      ),
    },
    { label: "File Path", value: document.filePath ?? "—" },
    { label: "File URL", value: document.fileUrl ?? "—" },
  ];

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate / Documents"
      title={document.label}
      metrics={[]}
    >
      <DetailSection title="Document Details" facts={facts} />

      <section className="detailPanel">
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Link href={"/candidate/documents" as Route}>
            <Button variant="outline">Back to Documents</Button>
          </Link>
        </div>
      </section>
    </WorkspaceShell>
  );
}
