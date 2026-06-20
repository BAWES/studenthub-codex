"use client";

import { useActionState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { NoteItem } from "@/modules/admin/note/schemas";
import { createNote } from "../actions";

type Props = {
  session: SessionUser;
  notes: NoteItem[];
  total: number;
};

export function AdminNotesPage({ session, notes, total }: Props) {
  const router = useRouter();

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Notes — view system-wide notes across companies, requests, and stories."
      metrics={[
        { label: "Total notes", value: total, note: "Notes in the system" },
      ]}
    >
      <section className="mb-6">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Add note</h3>
          <CreateNoteForm onSuccess={() => router.refresh()} />
        </div>
      </section>

      <DataTable
        title="Notes"
        description="All notes across the system. Click a note ID to view details."
        rows={notes.map((n) => ({ ...n, id: n.note_uuid }))}
        rowHref={undefined}
        columns={[
          {
            key: "note_type",
            label: "Type",
            render: (row) => (
              <span className="text-sm">{row.note_type || "—"}</span>
            ),
          },
          {
            key: "note_text",
            label: "Text preview",
            render: (row) => (
              <span className="text-sm truncate block max-w-[300px]">
                {row.note_text || "—"}
              </span>
            ),
          },
          {
            key: "staff_created",
            label: "Created by",
            render: (row) => (
              <span className="text-sm">
                {row.staff_created?.staff_name || row.created_by || "—"}
              </span>
            ),
          },
          {
            key: "note_created_datetime",
            label: "Created",
            render: (row) => {
              if (!row.note_created_datetime) return "—";
              return new Date(row.note_created_datetime).toLocaleDateString();
            },
          },
          {
            key: "company_id",
            label: "Company ID",
            render: (row) => (
              <span className="text-sm">{row.company_id ?? "—"}</span>
            ),
          },
        ]}
      />
    </WorkspaceShell>
  );
}

function CreateNoteForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const noteText = formData.get("noteText") as string;
      const noteType = (formData.get("noteType") as string) || undefined;
      const companyIdStr = formData.get("companyId") as string;
      const companyId = companyIdStr ? parseInt(companyIdStr, 10) : undefined;
      const requestUuid = (formData.get("requestUuid") as string) || undefined;
      const storyUuid = (formData.get("storyUuid") as string) || undefined;

      const result = await createNote({
        noteText,
        noteType,
        companyId: isNaN(companyId ?? NaN) ? undefined : companyId,
        requestUuid,
        storyUuid,
      });
      if (result.operation === "success") {
        onSuccess();
        return { error: undefined };
      }
      return { error: result.message };
    },
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={action}
      className="flex flex-wrap items-end gap-3"
      onSubmit={() => setTimeout(() => { formRef.current?.reset(); }, 100)}
    >
      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted-foreground">Note text</label>
        <input
          name="noteText"
          required
          maxLength={2000}
          placeholder="Enter note text..."
          className="w-64"
        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted-foreground">Type</label>
        <input
          name="noteType"
          maxLength={50}
          placeholder="e.g. general, feedback"
          className="w-36"
        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted-foreground">Company ID</label>
        <input
          name="companyId"
          type="number"
          placeholder="Optional"
          className="w-24"
        />
      </div>
      <Button
        type="submit"
        disabled={pending}
      >
        {pending ? "Adding..." : "Add"}
      </Button>
      {state?.error ? (
        <p className="text-xs w-full text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
