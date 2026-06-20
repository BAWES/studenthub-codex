"use client";

import { useActionState } from "react";
import type {
  CandidateDocumentItem,
  UploadDocumentState,
  DeleteDocumentState,
} from "@/modules/candidates/documents";

function acceptFor(type: string): string {
  switch (type) {
    case "photo":
    case "civilFront":
    case "civilBack":
      return "image/*";
    case "cv":
      return ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "video":
      return "video/*";
    default:
      return "*/*";
  }
}

const DOCUMENT_LABELS: Record<string, string> = {
  photo: "Personal Photo",
  cv: "CV / Resume",
  video: "Video Profile",
  civilFront: "Civil ID (Front)",
  civilBack: "Civil ID (Back)",
};

function DocumentCard({
  doc,
  uploadAction,
  deleteAction,
  uploadPending,
  deletePending,
}: {
  doc: CandidateDocumentItem;
  uploadAction: (payload: FormData) => void;
  deleteAction: (payload: FormData) => void;
  uploadPending: boolean;
  deletePending: boolean;
}) {
  const hasFile = Boolean(doc.filePath);

  return (
    <div className="detailPanel">
      <h3>{doc.label}</h3>
      <p className="detailPanelNote">
        {hasFile
          ? `File: ${doc.filePath?.split("/").pop()}`
          : "No file uploaded yet."}
      </p>

      {hasFile && doc.fileUrl && (
        <p>
          <a
            href={doc.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="textButton"
          >
            View file
          </a>
        </p>
      )}

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <form action={uploadAction}>
          <input type="hidden" name="type" value={doc.type} />
          <input
            type="file"
            name={`file_${doc.type}`}
            accept={acceptFor(doc.type)}
            required
          />
          <button type="submit" disabled={uploadPending} className="ghostButton">
            {uploadPending ? "Uploading..." : "Upload"}
          </button>
        </form>

        {hasFile && (
          <form action={deleteAction}>
            <input type="hidden" name="documentType" value={doc.type} />
            <button
              type="submit"
              disabled={deletePending}
              className="ghostButton danger"
            >
              {deletePending ? "Removing..." : "Remove"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function DocumentsClient({
  items,
  uploadAction,
  deleteAction,
}: {
  items: CandidateDocumentItem[];
  uploadAction: (prevState: UploadDocumentState, formData: FormData) => Promise<UploadDocumentState>;
  deleteAction: (prevState: DeleteDocumentState, formData: FormData) => Promise<DeleteDocumentState>;
}) {
  const [uploadState, uploadFormAction, uploadPending] = useActionState(
    uploadAction,
    { success: false, error: "" } as UploadDocumentState,
  );
  const [deleteState, deleteFormAction, deletePending] = useActionState(
    deleteAction,
    { success: false, error: "" } as DeleteDocumentState,
  );

  const error = uploadState.error || deleteState.error;

  return (
    <section>
      {error && <p className="formError">{error}</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {items.map((doc) => (
          <DocumentCard
            key={doc.type}
            doc={doc}
            uploadAction={uploadFormAction}
            deleteAction={deleteFormAction}
            uploadPending={uploadPending}
            deletePending={deletePending}
          />
        ))}
      </div>
    </section>
  );
}
