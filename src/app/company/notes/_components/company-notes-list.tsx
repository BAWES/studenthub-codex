"use client";

import { useCallback, useOptimistic, useRef, startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { createCompanyNote, updateCompanyNote, deleteCompanyNote } from "../actions";
import type { CompanyNoteListItem } from "../schemas";
import { Button } from "@/components/ui/button";

export function CompanyNotesList({
  notes: initialNotes,
  total,
  page,
  totalPages,
}: {
  notes: CompanyNoteListItem[];
  total: number;
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [createText, setCreateText] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // Optimistic updates for delete
  const [optimisticNotes, removeOptimistic] = useOptimistic(
    initialNotes,
    (state, noteUuid: string) => state.filter((n) => n.note_uuid !== noteUuid),
  );

  const handleCreate = useCallback(async () => {
    if (!createText.trim()) return;
    setCreating(true);
    setCreateError("");
    try {
      const result = await createCompanyNote({
        company_id: -1, // will be resolved server-side from session context
        note_text: createText.trim(),
      });
      if (result.note_uuid) {
        setCreateText("");
        formRef.current?.reset();
        router.refresh();
      }
    } catch {
      setCreateError("Failed to create note");
    } finally {
      setCreating(false);
    }
  }, [createText, router]);

  const handleDelete = useCallback(
    (noteUuid: string) => {
      startTransition(async () => {
        removeOptimistic(noteUuid);
        await deleteCompanyNote(noteUuid);
        router.refresh();
      });
    },
    [removeOptimistic, router],
  );

  const handleSaveEdit = useCallback(
    async (noteUuid: string) => {
      if (!editText.trim()) return;
      await updateCompanyNote({ noteUuid, note_text: editText.trim() });
      setEditingId(null);
      setEditText("");
      router.refresh();
    },
    [editText, router],
  );

  const startEdit = useCallback((note: CompanyNoteListItem) => {
    setEditingId(note.note_uuid);
    setEditText(note.note_text ?? "");
  }, []);

  return (
    <div className="space-y-4">
      {/* Create Note */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="text-sm font-semibold mb-3 text-foreground">
          Add a note
        </h3>
        <form ref={formRef} onSubmit={(e) => { e.preventDefault(); handleCreate(); }} className="flex flex-col gap-3">
          <textarea
            name="note_text"
            placeholder="Write your note..."
            rows={2}
            value={createText}
            onChange={(e) => setCreateText(e.target.value)}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-y text-foreground"
          />
          <div className="flex items-center justify-between">
            {createError && (
              <span className="text-xs text-destructive">{createError}</span>
            )}
            <Button
              type="submit"
              disabled={creating}
              size="sm"
              className="ml-auto"
            >
              {creating ? "Adding..." : "Add note"}
            </Button>
          </div>
        </form>
      </div>

      {/* Notes List */}
      {optimisticNotes.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No notes yet. Add your first note above.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {optimisticNotes.map((note) => (
            <NoteCard
              key={note.note_uuid}
              note={note}
              isEditing={editingId === note.note_uuid}
              editText={editText}
              onEditTextChange={setEditText}
              onStartEdit={() => startEdit(note)}
              onSaveEdit={() => handleSaveEdit(note.note_uuid)}
              onCancelEdit={() => { setEditingId(null); setEditText(""); }}
              onDelete={() => handleDelete(note.note_uuid)}
            />
          ))}
        </div>
      )}

      {/* Pagination hint */}
      {totalPages > 1 && (
        <div className="text-center text-xs text-muted-foreground">
          Page {page} of {totalPages} &middot; {total} notes total
        </div>
      )}
    </div>
  );
}

// ── NoteCard ────────────────────────────────────────────────────────────────

function NoteCard({
  note,
  isEditing,
  editText,
  onEditTextChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}: {
  note: CompanyNoteListItem;
  isEditing: boolean;
  editText: string;
  onEditTextChange: (v: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4" data-os-navigable tabIndex={0}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1.5">
            {note.note_type && (
              <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent-foreground">
                {note.note_type}
              </span>
            )}
            {note.company_name && (
              <span className="text-xs text-muted-foreground">
                {note.company_name}
              </span>
            )}
          </div>

          {/* Content */}
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={editText}
                onChange={(e) => onEditTextChange(e.target.value)}
                rows={3}
                className="rounded-md border border-border bg-card px-3 py-1.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-y w-full text-foreground"
              />
              <div className="flex gap-2">
                <Button
                  onClick={onSaveEdit}
                  size="sm"
                >
                  Save
                </Button>
                <Button
                  onClick={onCancelEdit}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap break-words text-foreground">
              {note.note_text}
            </p>
          )}
        </div>

        {/* Actions (only show when not editing) */}
        {!isEditing && (
          <div className="flex gap-1 shrink-0">
            <button
              onClick={onStartEdit}
              className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-border/30"
              title="Edit"
            >
              &#9998;
            </button>
            <button
              onClick={onDelete}
              className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-destructive/10"
              title="Delete"
            >
              &#10005;
            </button>
          </div>
        )}
      </div>

      {/* Timestamps */}
      <div className="flex gap-3 mt-2">
        {note.created_at && (
          <span className="text-[11px] text-muted-foreground">
            Created {formatDate(note.created_at)}
          </span>
        )}
        {note.updated_at && note.updated_at !== note.created_at && (
          <span className="text-[11px] text-muted-foreground">
            Updated {formatDate(note.updated_at)}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-KW", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
