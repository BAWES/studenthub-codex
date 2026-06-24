"use client";

import { useActionState } from "react";
import type {
  CandidateDocumentItem,
  UploadDocumentState,
  DeleteDocumentState,
} from "@/modules/candidates/documents";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">{doc.label}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <p className="text-sm text-muted-foreground m-0">
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
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              View file
            </a>
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <form action={uploadAction} className="flex items-center gap-2">
            <input type="hidden" name="type" value={doc.type} />
            <input
              type="file"
              name={`file_${doc.type}`}
              accept={acceptFor(doc.type)}
              required
              className="text-sm text-foreground file:mr-3 file:rounded file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20"
            />
            <Button type="submit" variant="secondary" size="sm" disabled={uploadPending}>
              {uploadPending ? "Uploading..." : "Upload"}
            </Button>
          </form>

          {hasFile && (
            <form action={deleteAction}>
              <input type="hidden" name="documentType" value={doc.type} />
              <Button
                type="submit"
                variant="destructive"
                size="sm"
                disabled={deletePending}
              >
                {deletePending ? "Removing..." : "Remove"}
              </Button>
            </form>
          )}
        </div>
      </CardContent>
    </Card>
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
      {error && <Alert variant="destructive" className="py-2 text-sm mb-4">{error}</Alert>}

      <div className="flex flex-col gap-4">
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
