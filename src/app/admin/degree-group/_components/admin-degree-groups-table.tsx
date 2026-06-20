"use client";

import { useActionState, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { DegreeGroupItem } from "../schemas";
import { createDegreeGroup, updateDegreeGroup, deleteDegreeGroup } from "../actions";

type Props = {
  session: SessionUser;
  degreeGroups: DegreeGroupItem[];
};

export function AdminDegreeGroupsTable({ session, degreeGroups }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Manage degree groups — organize degree classifications across the system."
      metrics={[
        { label: "Total degree groups", value: degreeGroups.length, note: "Degree groups in the system" },
      ]}
    >
      <section className="mb-6">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--ink)" }}>Add degree group</h3>
          <CreateDegreeGroupForm onSuccess={() => router.refresh()} />
        </div>
      </section>

      <DataTable
        title="Degree Groups"
        description="All degree groups. Click a row to edit or delete."
        rows={degreeGroups.map((g) => ({ ...g, id: g.degree_group_uuid }))}
        rowHref={undefined}
        columns={[
          {
            key: "name_en",
            label: "English name",
            render: (row) =>
              editingId === row.degree_group_uuid ? (
                <EditDegreeGroupForm
                  row={row}
                  onDone={() => { setEditingId(null); router.refresh(); }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <button
                  type="button"
                  className="text-sm hover:underline"
                  style={{ color: "var(--sh-primary)" }}
                  onClick={() => setEditingId(row.degree_group_uuid)}
                >
                  {row.degree_group_name_en}
                </button>
              ),
          },
          {
            key: "name_ar",
            label: "Arabic name",
            render: (row) => row.degree_group_name_ar || "—",
          },
          {
            key: "sort_order",
            label: "Sort order",
            render: (row) => row.degree_group_sort_order ?? "—",
          },
          {
            key: "skip_major",
            label: "Skip major",
            render: (row) => (row.skip_major ? "Yes" : "No"),
          },
          {
            key: "actions",
            label: "Actions",
            render: (row) =>
              editingId !== row.degree_group_uuid ? (
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded hover:bg-red-500/10"
                  style={{ color: "var(--sh-error)" }}
                  onClick={async () => {
                    if (confirm(`Delete degree group "${row.degree_group_name_en}"?`)) {
                      const result = await deleteDegreeGroup(row.degree_group_uuid);
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

function CreateDegreeGroupForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const nameEn = formData.get("nameEn") as string;
      const nameAr = formData.get("nameAr") as string;
      const sortOrder = formData.get("sortOrder") as string;
      const skipMajor = formData.get("skipMajor") as string;
      const result = await createDegreeGroup(
        nameEn,
        nameAr || undefined,
        sortOrder ? parseInt(sortOrder) : undefined,
        skipMajor ? parseInt(skipMajor) : undefined,
      );
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
        <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>English name *</label>
        <input
          name="nameEn"
          required
          maxLength={255}
          placeholder="e.g. Science, Arts, Engineering"
          className="h-9 rounded-lg px-3 text-sm border"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Arabic name</label>
        <input
          name="nameAr"
          maxLength={255}
          placeholder="الاسم بالعربية"
          className="h-9 rounded-lg px-3 text-sm border"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Sort order</label>
        <input
          name="sortOrder"
          type="number"
          placeholder="0"
          className="h-9 rounded-lg px-3 text-sm border w-20"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Skip major</label>
        <select
          name="skipMajor"
          className="h-9 rounded-lg px-3 text-sm border"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
        >
          <option value="0">No</option>
          <option value="1">Yes</option>
        </select>
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

function EditDegreeGroupForm({
  row,
  onDone,
  onCancel,
}: {
  row: DegreeGroupItem;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const nameEn = formData.get("nameEn") as string;
      const nameAr = formData.get("nameAr") as string;
      const sortOrder = formData.get("sortOrder") as string;
      const skipMajor = formData.get("skipMajor") as string;
      const result = await updateDegreeGroup(
        row.degree_group_uuid,
        nameEn,
        nameAr || null,
        sortOrder ? parseInt(sortOrder) : null,
        skipMajor ? parseInt(skipMajor) : null,
      );
      if (result.operation === "success") {
        onDone();
        return { error: undefined };
      }
      return { error: result.message };
    },
    null,
  );

  return (
    <form action={action} className="flex items-center gap-2 flex-wrap">
      <input
        name="nameEn"
        defaultValue={row.degree_group_name_en}
        required
        maxLength={255}
        className="h-8 rounded px-2 text-sm border w-36"
        style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
      />
      <input
        name="nameAr"
        defaultValue={row.degree_group_name_ar || ""}
        maxLength={255}
        className="h-8 rounded px-2 text-sm border w-36"
        style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
      />
      <input
        name="sortOrder"
        defaultValue={row.degree_group_sort_order ?? ""}
        type="number"
        className="h-8 rounded px-2 text-sm border w-16"
        style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
      />
      <select
        name="skipMajor"
        defaultValue={row.skip_major ? "1" : "0"}
        className="h-8 rounded px-2 text-sm border w-20"
        style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
      >
        <option value="0">No</option>
        <option value="1">Yes</option>
      </select>
      <button
        type="submit"
        disabled={pending}
        className="h-8 rounded px-3 text-xs font-semibold"
        style={{ background: "var(--sh-primary)", color: "#fff" }}
      >
        {pending ? "..." : "Save"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="h-8 rounded px-3 text-xs"
        style={{ color: "var(--muted)" }}
      >
        Cancel
      </button>
      {state?.error ? (
        <p className="text-xs" style={{ color: "var(--sh-error)" }}>{state.error}</p>
      ) : null}
    </form>
  );
}
