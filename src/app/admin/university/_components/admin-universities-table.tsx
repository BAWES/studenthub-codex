"use client";

import { useActionState, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { UniversityItem } from "@/modules/admin/university/schemas";
import { createUniversity, updateUniversity, deleteUniversity } from "@/modules/admin/university/actions";

type Props = {
  session: SessionUser;
  universities: UniversityItem[];
};

export function AdminUniversitiesTable({ session, universities }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Manage universities"
      metrics={[
        { label: "Total universities", value: universities.length, note: "Universities in the system" },
      ]}
    >
      <section className="mb-6">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--ink)" }}>Add university</h3>
          <CreateUniversityForm onSuccess={() => router.refresh()} />
        </div>
      </section>

      <DataTable
        title="Universities"
        description="All universities. Click a name to edit or delete."
        rows={universities.map((u) => ({ ...u, id: u.university_id }))}
        rowHref={undefined}
        columns={[
          {
            key: "university_name_en",
            label: "English name",
            render: (row) =>
              editingId === row.university_id ? (
                <EditUniversityForm
                  row={row}
                  onDone={() => { setEditingId(null); router.refresh(); }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <button
                  type="button"
                  className="text-sm hover:underline"
                  style={{ color: "var(--sh-primary)" }}
                  onClick={() => setEditingId(row.university_id)}
                >
                  {row.university_name_en || "—"}
                </button>
              ),
          },
          {
            key: "university_name_ar",
            label: "Arabic name",
            render: (row) => <span className="text-sm">{row.university_name_ar || "—"}</span>,
          },
          {
            key: "university_data_source",
            label: "Data source",
            render: (row) => <span className="text-sm">{row.university_data_source != null ? row.university_data_source : "—"}</span>,
          },
          {
            key: "actions",
            label: "Actions",
            render: (row) =>
              editingId !== row.university_id ? (
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded hover:bg-red-500/10"
                  style={{ color: "var(--sh-error)" }}
                  onClick={async () => {
                    if (confirm(`Delete university "${row.university_name_en || "Untitled"}"?`)) {
                      const result = await deleteUniversity(row.university_id);
                      if (result.operation === "error") {
                        alert(result.message);
                      }
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

function CreateUniversityForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const result = await createUniversity({
        university_name_en: (formData.get("university_name_en") as string) || null,
        university_name_ar: (formData.get("university_name_ar") as string) || null,
        university_data_source: (formData.get("university_data_source") as string) ? Number(formData.get("university_data_source")) : null,
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
        <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>English name</label>
        <input name="university_name_en" maxLength={100} placeholder="e.g. Kuwait University" className="h-9 rounded-lg px-3 text-sm border" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }} />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Arabic name</label>
        <input name="university_name_ar" maxLength={100} placeholder="جامعة الكويت" className="h-9 rounded-lg px-3 text-sm border" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }} />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Data source</label>
        <input name="university_data_source" type="number" placeholder="1" className="h-9 rounded-lg px-3 text-sm border w-20" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="h-9 rounded-lg px-4 text-sm font-semibold"
        style={{ background: "var(--sh-primary)", color: "#fff" }}
      >
        {pending ? "Adding..." : "Add"}
      </button>
      {state?.error ? (
        <p className="text-xs w-full" style={{ color: "var(--sh-error)" }}>{state.error}</p>
      ) : null}
    </form>
  );
}

function EditUniversityForm({
  row,
  onDone,
  onCancel,
}: {
  row: UniversityItem;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const result = await updateUniversity({
        university_id: row.university_id,
        university_name_en: (formData.get("university_name_en") as string) || null,
        university_name_ar: (formData.get("university_name_ar") as string) || null,
        university_data_source: (formData.get("university_data_source") as string) ? Number(formData.get("university_data_source")) : null,
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
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input name="university_name_en" defaultValue={row.university_name_en || ""} maxLength={100} placeholder="English name" className="h-8 rounded px-2 text-sm border w-36" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }} />
      <input name="university_name_ar" defaultValue={row.university_name_ar || ""} maxLength={100} placeholder="Arabic name" className="h-8 rounded px-2 text-sm border w-36" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }} />
      <input name="university_data_source" defaultValue={row.university_data_source != null ? String(row.university_data_source) : ""} type="number" placeholder="Src" className="h-8 rounded px-2 text-sm border w-14" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }} />
      <button type="submit" disabled={pending} className="h-8 rounded px-3 text-xs font-semibold" style={{ background: "var(--sh-primary)", color: "#fff" }}>{pending ? "..." : "Save"}</button>
      <button type="button" onClick={onCancel} className="h-8 rounded px-3 text-xs" style={{ color: "var(--muted)" }}>Cancel</button>
      {state?.error ? <p className="text-xs" style={{ color: "var(--sh-error)" }}>{state.error}</p> : null}
    </form>
  );
}
