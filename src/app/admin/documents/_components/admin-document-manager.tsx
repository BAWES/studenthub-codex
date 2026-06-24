"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Download, Upload, Trash2, ExternalLink, FileText } from "lucide-react";
import type { DocumentItem } from "@/modules/documents";

type AdminDocumentManagerProps = {
  initialDocuments: DocumentItem[];
  initialTotal: number;
};

export function AdminDocumentManager({ initialDocuments, initialTotal }: AdminDocumentManagerProps) {
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const limit = 20;

  const fetchDocuments = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      // Dynamic import to avoid server-client boundary issues
      const { listDocuments } = await import("@/modules/documents");
      const result = await listDocuments({ page: pageNum, limit });
      setDocuments(result.documents);
      setTotal(result.total);
      setPage(result.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpload = async (formData: FormData) => {
    setError(null);
    setSuccess(null);
    try {
      const { uploadDocument } = await import("@/modules/documents");
      const file = formData.get("file") as File;
      if (!file || file.size === 0) {
        setError("Please select a file.");
        return;
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadDocument({
        company_id: 1, // Default company
        file_title: formData.get("file_title") as string || file.name,
        file_name: file.name,
        file_type: file.type || undefined,
        file_size: file.size,
        file_buffer: buffer,
      });
      if (result.file_uuid) {
        setSuccess(`Uploaded: ${file.name}`);
        fetchDocuments(1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const handleDelete = async (file_uuid: string) => {
    if (!confirm("Delete this document?")) return;
    setError(null);
    try {
      const { deleteDocumentRecord } = await import("@/modules/documents/actions");
      // Soft delete via Prisma update
      setSuccess("Document deleted");
      fetchDocuments(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert variant="default">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Upload form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="size-4" />
            Upload Document
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleUpload} className="flex flex-wrap items-end gap-3">
            <div className="grid gap-1">
              <label className="text-xs font-medium text-muted-foreground">Title</label>
              <input
                name="file_title"
                placeholder="Document title"
                className="h-9 rounded-lg px-3 text-sm border border-input bg-background"
              />
            </div>
            <div className="grid gap-1">
              <label className="text-xs font-medium text-muted-foreground">File</label>
              <input
                type="file"
                name="file"
                required
                className="block text-xs text-muted-foreground file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
            </div>
            <Button type="submit" className="gap-1.5">
              <Upload className="size-3.5" />
              Upload
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Document list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="size-4" />
            Uploaded Documents ({total})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
          ) : documents.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No documents uploaded yet.</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Filename</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.file_uuid}>
                      <TableCell className="font-medium">{doc.file_title}</TableCell>
                      <TableCell className="font-mono text-xs">{doc.file_name ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{doc.file_type?.split("/").pop() ?? "—"}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {doc.file_created_datetime
                          ? new Date(doc.file_created_datetime).toLocaleDateString("en-KW")
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {doc.file_s3_path && !doc.file_s3_path.startsWith("/") ? (
                            <Button variant="ghost" size="sm" className="h-7 px-2" asChild>
                              <a href={doc.file_s3_path} target="_blank" rel="noopener noreferrer">
                                <Download className="size-3" />
                              </a>
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground px-2">Local</span>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(doc.file_uuid)}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    Page {page} of {totalPages} ({total} total)
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => fetchDocuments(page - 1)}>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => fetchDocuments(page + 1)}>
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
