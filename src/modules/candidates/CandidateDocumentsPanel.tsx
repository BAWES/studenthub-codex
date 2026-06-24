"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  FileText,
  Image,
  Video,
  Camera,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  staffListCandidateDocuments,
  staffUploadCandidateDocument,
} from "@/modules/candidates/documents";
import { DOCUMENT_TYPES } from "@/modules/candidates/documents/constants";
import type { CandidateDocumentItem } from "@/modules/candidates/documents/schemas";

// ---------------------------------------------------------------------------
// Document type display config
// ---------------------------------------------------------------------------

const DOCUMENT_CONFIG: Record<
  string,
  {
    label: string;
    description: string;
    icon: React.ElementType;
    accept: string;
  }
> = {
  photo: {
    label: "Personal Photo",
    description: "Profile picture for the candidate",
    icon: Image,
    accept: "image/*",
  },
  cv: {
    label: "CV / Resume",
    description: "Upload the candidate's CV in PDF or Word format",
    icon: FileText,
    accept: ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
  video: {
    label: "Video Profile",
    description: "Video introduction or profile",
    icon: Video,
    accept: "video/*",
  },
  civilFront: {
    label: "Civil ID (Front)",
    description: "Front side of Civil ID card",
    icon: Camera,
    accept: "image/*",
  },
  civilBack: {
    label: "Civil ID (Back)",
    description: "Back side of Civil ID card",
    icon: Camera,
    accept: "image/*",
  },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type Props = {
  candidateId: number;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CandidateDocumentsPanel({ candidateId }: Props) {
  const [documents, setDocuments] = useState<CandidateDocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingType, setUploadingType] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const result = await staffListCandidateDocuments({ candidateId });
      setDocuments(result.items);
    } catch (e) {
      console.error("[CandidateDocumentsPanel] Failed to list documents:", e);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUpload = async (documentType: string, formData: FormData) => {
    setUploadingType(documentType);
    try {
      const result = await staffUploadCandidateDocument(
        candidateId,
        { success: false },
        formData,
      );

      if (result.success) {
        toast.success(`${DOCUMENT_CONFIG[documentType]?.label ?? documentType} uploaded`);
        await fetchDocuments();
      } else {
        toast.error(result.error ?? "Upload failed");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploadingType(null);
    }
  };

  const getFileUrl = (doc: CandidateDocumentItem): string | null => {
    // Use the presigned URL if available, otherwise fall back to the file path
    if (doc.fileUrl) return doc.fileUrl;
    if (doc.filePath && doc.filePath.startsWith("/")) {
      return doc.filePath;
    }
    return doc.filePath;
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {DOCUMENT_TYPES.map((type) => {
          const config = DOCUMENT_CONFIG[type];
          if (!config) return null;
          const Icon = config.icon;
          const doc = documents.find((d) => d.type === type);
          const fileUrl = doc ? getFileUrl(doc) : null;
          const hasUpload = !!doc?.filePath;

          return (
            <Card key={type}>
              <CardHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
                <div className="flex items-center gap-2">
                  <Icon className="size-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-semibold">
                    {config.label}
                  </CardTitle>
                </div>
                {hasUpload ? (
                  <Badge variant="success" className="gap-1 text-[10px]">
                    <CheckCircle2 className="size-3" />
                    Uploaded
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1 text-[10px]">
                    <XCircle className="size-3" />
                    Missing
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-3 p-4">
                <p className="text-xs text-muted-foreground">
                  {config.description}
                </p>

                {/* Preview / download link */}
                {hasUpload && fileUrl ? (
                  <div className="flex items-center gap-2">
                    {fileUrl.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i) ? (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative block overflow-hidden rounded-md border bg-muted/30"
                      >
                        { }
                        <img
                          src={fileUrl}
                          alt={config.label}
                          className="h-20 w-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                        />
                      </a>
                    ) : (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-primary underline hover:text-primary/80"
                      >
                        <FileText className="size-3.5" />
                        {doc?.filePath?.split("/").pop() ?? "View file"}
                      </a>
                    )}
                  </div>
                ) : null}

                {/* Upload form */}
                <form
                  action={async (formData) => {
                    await handleUpload(type, formData);
                  }}
                  className="space-y-2"
                >
                  <div className="space-y-1">
                    <Label htmlFor={`file_${type}`} className="text-xs">
                      {hasUpload ? "Replace file" : "Select file"}
                    </Label>
                    <Input
                      id={`file_${type}`}
                      type="file"
                      name={`file_${type}`}
                      accept={config.accept}
                      className="h-9 text-xs"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    variant={hasUpload ? "outline" : "default"}
                    disabled={uploadingType === type}
                    className="w-full gap-1.5"
                  >
                    {uploadingType === type ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="size-3.5" />
                        {hasUpload ? "Replace" : "Upload"}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {loading && documents.length === 0 && (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          <Loader2 className="mr-2 size-4 animate-spin" />
          Loading documents...
        </div>
      )}
    </div>
  );
}
