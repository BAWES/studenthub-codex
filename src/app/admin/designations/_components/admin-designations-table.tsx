"use client";

import { useActionState, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { DesignationRow } from "../schemas";
import { createDesignation, updateDesignation, deleteDesignation } from "../actions";

type Props = {
  session: SessionUser;
  designations: DesignationRow[];
};

export function AdminDesignationsTable({ session, designations }: Props) {
  const router = useRouter();
  const [editingUuid, setEditingUuid] = useState<string | null>(null);

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Manage designations — job titles used across departments, employees, and evaluations."
      metrics={[
        { label: "Total designations", value: designations.length, note: "Job titles in the system" },
      ]}
    >
      <section className="mb-6">
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Add designation</h3>
          <CreateDesignationForm onSuccess={() => router.refresh()} />
        </div>
      </section>

      <DataTable
        title="Designations"
        description="All job titles. Click a row to edit or archive."
        rows={designations.map((d) => ({ ...d, id: d.designation_uuid }))}
        rowHref={undefined}
        columns={[
          {
            key: "name_en",
            label: "English name",
            render: (row) => (
              editingUuid === row.designation_uuid ? (
                <EditDesignationForm
                  row={row}
                  onDone={() => { setEditingUuid(null); router.refresh(); }}
                  onCancel={() => setEditingUuid(null)}
                />
              ) : (
                <button
                  type="button"
                  className="text-sm hover:underline text-primary"
                  onClick={() => setEditingUuid(row.designation_uuid)}
                >
                  {row.designation_name_en}
                </button>
              )
            ),
          },
          {
            key: "name_ar",
            label: "Arabic name",
            render: (row) => row.designation_name_ar ?? "—",
          },
          {
            key: "actions",
            label: "Actions",
            render: (row) =>
              editingUuid !== row.designation_uuid ? (
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded hover:bg-red-500/10 text-destructive"
                  onClick={async () => {
                    if (confirm(`Delete "${row.designation_name_en}"?`)) {
                      await deleteDesignation(row.designation_uuid);
                      router.refresh();
                    }
                  }}
                >
                  Delete
                </button>
              ) : null,
          },
        ]}
      />
    </WorkspaceShell>
  );
}

function CreateDesignationForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const nameEn = formData.get("nameEn") as string;
      const nameAr = formData.get("nameAr") as string;
      const result = await createDesignation({ nameEn, nameAr: nameAr || undefined });
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
        <label className="text-xs font-medium text-muted-foreground">English name</label>
        <input
          name="nameEn"
          required
          maxLength={255}
          placeholder="e.g. Software Engineer"
          className="h-9 rounded-lg px-3 text-sm border bg-background text-foreground"        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted-foreground">Arabic name</label>
        <input
          name="nameAr"
          maxLength={255}
          placeholder="مهندس برمجيات"
          className="h-9 rounded-lg px-3 text-sm border bg-background text-foreground"        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="h-9 rounded-lg px-4 text-sm font-semibold bg-primary text-primary-foreground"
      >
        {pending ? "Adding..." : "Add"}
      </button>
      {state?.error ? (
        <p className="text-xs w-full text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}

function EditDesignationForm({
  row,
  onDone,
  onCancel,
}: {
  row: DesignationRow;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const nameEn = formData.get("nameEn") as string;
      const nameAr = formData.get("nameAr") as string;
      const result = await updateDesignation({
        uuid: row.designation_uuid,
        nameEn,
        nameAr: nameAr || undefined,
      });
      if (result.operation === "success") {
        onDone();
        return { error: undefined };
      }
      return { error: result.message };
    },
    null,
  );

  return (
    <form action={action} className="flex items-center gap-2">
      <input
        name="nameEn"
        defaultValue={row.designation_name_en}
        required
        maxLength={255}
        className="h-8 rounded px-2 text-sm border w-40 bg-card border-border text-foreground"
      />
      <input
        name="nameAr"
        defaultValue={row.designation_name_ar ?? ""}
        maxLength={255}
        className="h-8 rounded px-2 text-sm border w-40 bg-card border-border text-foreground"
      />
      <button
        type="submit"
        disabled={pending}
        className="h-8 rounded px-3 text-xs font-semibold bg-primary text-primary-foreground"
      >
        {pending ? "..." : "Save"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="h-8 rounded px-3 text-xs text-muted-foreground"
      >
        Cancel
      </button>
      {state?.error ? (
        <p className="text-xs text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
