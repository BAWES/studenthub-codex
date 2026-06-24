"use client";

import { useActionState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Upload, Trash2, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { AdminDocumentActionResult } from "@/modules/admin/candidates/[id]";

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

export function AdminDocumentsUpload({
  candidateId,
  documents,
  uploadAction,
  deleteAction,
}: {
  candidateId: number;
  documents: { type: string; label: string; url: string | null }[];
  uploadAction: (prevState: AdminDocumentActionResult, formData: FormData) => Promise<AdminDocumentActionResult>;
  deleteAction: (prevState: AdminDocumentActionResult, formData: FormData) => Promise<AdminDocumentActionResult>;
}) {
  const [uploadState, uploadFormAction, uploadPending] = useActionState(
    uploadAction,
    { success: false } as AdminDocumentActionResult,
  );
  const [deleteState, deleteFormAction, deletePending] = useActionState(
    deleteAction,
    { success: false } as AdminDocumentActionResult,
  );
  const uploadFormRef = useRef<HTMLFormElement>(null);
  const deleteFormRef = useRef<HTMLFormElement>(null);

  const error = uploadState.error || deleteState.error;
  const lastSuccess = uploadState.success || deleteState.success;

  // Build a map of existing docs by type for quick lookup
  const docMap = new Map(documents.map((d) => [d.type, d.url]));

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {lastSuccess && !error && (
        <Alert>
          <AlertDescription>Document updated successfully.</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {DOCUMENT_TYPES.map(({ type, label }) => {
          const existingUrl = docMap.get(type);

          return (
            <Card key={type}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{label}</CardTitle>
                  {existingUrl ? (
                    <Badge variant="default" className="bg-green-600 text-xs">Uploaded</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">Missing</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Upload form */}
                <form
                  ref={uploadFormRef}
                  action={uploadFormAction}
                  className="space-y-2"
                >
                  <input type="hidden" name="candidateId" value={candidateId} />
                  <input type="hidden" name="documentType" value={type} />
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      name="file"
                      accept={acceptFor(type)}
                      className="block w-full text-xs text-muted-foreground
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
                  </div>
                </form>

                {/* Existing file actions */}
                {existingUrl && (
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={existingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="size-3" />
                      View file
                    </a>

                    <form
                      ref={deleteFormRef}
                      action={deleteFormAction}
                      className="inline"
                    >
                      <input type="hidden" name="candidateId" value={candidateId} />
                      <input type="hidden" name="documentType" value={type} />
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
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
