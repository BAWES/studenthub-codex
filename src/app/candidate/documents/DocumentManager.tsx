"use client";

import { useActionState, useRef } from "react";
import Link from "next/link";
import { Upload, Trash2, FileText, Image, Video, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { uploadCandidateDocument, deleteCandidateDocument, type ListDocumentsResult, type UploadDocumentState, type DeleteDocumentState } from "./actions";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DOCUMENT_TYPE_ICONS: Record<string, React.ReactNode> = {
  photo: <Image className="size-5" />,
  cv: <FileText className="size-5" />,
  video: <Video className="size-5" />,
  civilFront: <Image className="size-5" />,
  civilBack: <Image className="size-5" />,
};

const DOCUMENT_DESCRIPTIONS: Record<string, string> = {
  photo: "JPEG, PNG, WebP or GIF. Max 5 MB.",
  cv: "PDF, DOC or DOCX. Max 10 MB.",
  video: "MP4, WebM, OGG or MOV. Max 50 MB.",
  civilFront: "Front of your Civil ID. JPEG, PNG, WebP or GIF. Max 5 MB.",
  civilBack: "Back of your Civil ID. JPEG, PNG, WebP or GIF. Max 5 MB.",
};

// ---------------------------------------------------------------------------
// Upload form
// ---------------------------------------------------------------------------

function UploadForm({ documentType }: { documentType: string }) {
  const [state, formAction, pending] = useActionState<UploadDocumentState, FormData>(
    uploadCandidateDocument,
    { success: false },
  );
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        name={`file_${documentType}`}
        className="block w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[var(--sh-info-bg)] file:text-[var(--sh-info)] hover:file:opacity-80"
        disabled={pending}
        onChange={() => {
          // Auto-submit when a file is selected
          if (inputRef.current?.files?.length) {
            inputRef.current.form?.requestSubmit();
          }
        }}
      />
      {pending && (
        <span className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--sh-info)" }}>
          <Loader2 className="size-3 animate-spin" />
          Uploading...
        </span>
      )}
      {state.success && (
        <span className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--sh-success)" }}>
          <CheckCircle2 className="size-3" />
          Uploaded successfully
        </span>
      )}
      {state.error && (
        <span className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--sh-danger)" }}>
          <AlertCircle className="size-3" />
          {state.error}
        </span>
      )}
    </form>
  );
}

// ---------------------------------------------------------------------------
// Delete form
// ---------------------------------------------------------------------------

function DeleteForm({ documentType }: { documentType: string }) {
  const [state, formAction, pending] = useActionState<DeleteDocumentState, FormData>(
    deleteCandidateDocument,
    { success: false },
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="documentType" value={documentType} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg border-0 cursor-pointer transition-opacity disabled:opacity-50"
        style={{
          color: "var(--sh-danger)",
          background: "color-mix(in srgb, var(--sh-danger) 12%, transparent)",
        }}
      >
        {pending ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <Trash2 className="size-3" />
        )}
        Delete
      </button>
      {state.success && (
        <span className="block mt-1 text-[11px]" style={{ color: "var(--sh-success)" }}>
          <CheckCircle2 className="size-3 inline mr-1" />
          Deleted
        </span>
      )}
      {state.error && (
        <span className="block mt-1 text-[11px]" style={{ color: "var(--sh-danger)" }}>
          <AlertCircle className="size-3 inline mr-1" />
          {state.error}
        </span>
      )}
    </form>
  );
}

// ---------------------------------------------------------------------------
// DocumentCard
// ---------------------------------------------------------------------------

function DocumentCard({
  type,
  label,
  filePath,
  fileUrl,
}: ListDocumentsResult["items"][number]) {
  const hasFile = Boolean(filePath);

  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3 transition-transform duration-300"
      style={{
        background: "var(--sh-glass-bg)",
        border: hasFile
          ? "1px solid color-mix(in srgb, var(--sh-success) 30%, transparent)"
          : "1px solid var(--sh-glass-border)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="size-8 rounded-lg flex items-center justify-center"
            style={{
              background: hasFile
                ? "color-mix(in srgb, var(--sh-success) 15%, transparent)"
                : "color-mix(in srgb, var(--muted) 12%, transparent)",
              color: hasFile ? "var(--sh-success)" : "var(--muted)",
            }}
          >
            {DOCUMENT_TYPE_ICONS[type] ?? <FileText className="size-5" />}
          </span>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
              {label}
            </p>
            <p className="text-[11px]" style={{ color: "var(--muted)" }}>
              {DOCUMENT_DESCRIPTIONS[type] ?? ""}
            </p>
          </div>
        </div>
        {hasFile && (
          <span
            className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: "color-mix(in srgb, var(--sh-success) 15%, transparent)",
              color: "var(--sh-success)",
            }}
          >
            <CheckCircle2 className="size-2.5" />
            Uploaded
          </span>
        )}
      </div>

      {/* File preview or upload */}
      <div className="flex items-center gap-2 min-h-[32px]">
        {hasFile && fileUrl ? (
          <>
            <Link
              href={fileUrl}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg no-underline transition-opacity hover:opacity-80"
              style={{
                color: "var(--sh-info)",
                background: "color-mix(in srgb, var(--sh-info) 12%, transparent)",
              }}
            >
              <FileText className="size-3" />
              View file
            </Link>
            <DeleteForm documentType={type} />
          </>
        ) : (
          <div className="w-full">
            <UploadForm documentType={type} />
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DocumentManager
// ---------------------------------------------------------------------------

export function DocumentManager({ items }: { items: ListDocumentsResult["items"] }) {
  if (items.length === 0) {
    return (
      <div
        className="rounded-xl p-8 text-center"
        style={{
          background: "var(--sh-glass-bg)",
          border: "1px solid var(--sh-glass-border)",
        }}
      >
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--ink)" }}>
          No document types available
        </p>
        <p className="text-xs" style={{ color: "var(--muted)" }}>
          There are no document types configured for your account.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item) => (
          <DocumentCard key={item.type} {...item} />
        ))}
      </div>

      {/* Info banner */}
      <div
        className="rounded-xl p-4 flex items-start gap-3"
        style={{
          background: "color-mix(in srgb, var(--sh-info) 8%, transparent)",
          border: "1px solid color-mix(in srgb, var(--sh-info) 20%, transparent)",
        }}
      >
        <AlertCircle className="size-4 shrink-0 mt-0.5" style={{ color: "var(--sh-info)" }} />
        <div className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
          <strong>Documents</strong> are tied to your candidate profile. Uploaded files are
          visible to staff and employers reviewing your profile. You can replace or delete
          any document at any time.
        </div>
      </div>
    </div>
  );
}
