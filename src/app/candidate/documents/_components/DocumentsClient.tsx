"use client";

import { useActionState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Upload, Trash2, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type {
  CandidateDocumentItem,
  UploadDocumentState,
  DeleteDocumentState,
} from "@/modules/candidates/documents";

// Document type map for display labels and accepted file types
const DOCUMENT_TYPES = [
  { type: "photo", label: "Personal Photo", accept: "image/*" },
  { type: "cv", label: "CV / Resume", accept: ".pdf,.doc,.docx" },
  { type: "video", label: "Video Profile", accept: "video/*" },
  { type: "civilFront", label: "Civil ID (Front)", accept: "image/*" },
  { type: "civilBack", label: "Civil ID (Back)", accept: "image/*" },
] as const;

function acceptFor(type: string): string {
  const entry = DOCUMENT_TYPES.find((d) => d.type === type);
  return entry?.accept ?? "*/*";
}

function labelFor(type: string): string {
  const entry = DOCUMENT_TYPES.find((d) => d.type === type);
  return entry?.label ?? type;
}

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
  const hasFile = Boolean(doc.fileUrl);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{doc.label}</CardTitle>
          {hasFile ? (
            <Badge variant="default" className="bg-green-600 text-xs">Uploaded</Badge>
          ) : (
            <Badge variant="outline" className="text-xs">Missing</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {hasFile && doc.fileUrl && (
          <p className="text-xs text-muted-foreground">
            <a
              href={doc.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              <ExternalLink className="size-3" />
              View file
            </a>
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <form action={uploadAction} className="flex items-center gap-2">
            <input type="hidden" name="type" value={doc.type} />
            <input
              type="file"
              name={`file_${doc.type}`}
              accept={acceptFor(doc.type)}
              className="block w-full max-w-[180px] text-xs text-muted-foreground
                file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0
                file:text-xs file:font-medium
                file:bg-primary/10 file:text-primary
                hover:file:bg-primary/20
                cursor-pointer"
              required
            />
            <Button
              type="submit"
              size="sm"
              variant="outline"
              disabled={uploadPending}
              className="shrink-0 gap-1.5"
            >
              <Upload className="size-3.5" />
              {uploadPending ? "..." : "Upload"}
            </Button>
          </form>

          {hasFile && (
            <form action={deleteAction}>
              <input type="hidden" name="documentType" value={doc.type} />
              <Button
                type="submit"
                size="sm"
                variant="ghost"
                disabled={deletePending}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1 text-xs h-7 px-2"
              >
                <Trash2 className="size-3" />
                {deletePending ? "..." : "Remove"}
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
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {uploadState.success && !error && (
        <Alert>
          <AlertDescription>Document uploaded successfully.</AlertDescription>
        </Alert>
      )}

      {deleteState.success && !error && (
        <Alert>
          <AlertDescription>Document removed successfully.</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
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
    </div>
  );
}
