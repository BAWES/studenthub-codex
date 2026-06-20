"use client";

import { useActionState, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { DegreeItem } from "../schemas";
import { createDegree, updateDegree, deleteDegree } from "../actions";

type Props = {
  session: SessionUser;
  degrees: DegreeItem[];
};

export function AdminDegreeTable({ session, degrees }: Props) {
  const router = useRouter();
  const [editingUuid, setEditingUuid] = useState<string | null>(null);

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Manage Degrees"
      metrics={[
        { label: "Total degrees", value: degrees.length, note: "Degrees in the system" },
      ]}
    >
      <section className="mb-6">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Add a degree</h3>
          <CreateDegreeForm onSuccess={() => router.refresh()} />
        </div>
      </section>

      <DataTable
        title="Degrees"
        description="List of all degrees."
        rows={degrees.map((d) => ({ ...d, id: d.degree_uuid }))}
        rowHref={undefined}
        columns={[
          {
            key: "degree_name_en",
            label: "Name (English)",
            render: (row) =>
              editingUuid === row.degree_uuid ? (
                <EditDegreeForm
                  row={row}
                  onDone={() => {
                    setEditingUuid(null);
                    router.refresh();
                  }}
                  onCancel={() => setEditingUuid(null)}
                />
              ) : (
                <button
                  type="button"
                  className="text-sm hover:underline text-primary"
                  onClick={() => setEditingUuid(row.degree_uuid)}
                >
                  {row.degree_name_en ?? "—"}
                </button>
              ),
          },
          {
            key: "degree_name_ar",
            label: "Name (Arabic)",
            render: (row) => (
              <span className="text-sm text-muted-foreground" dir="rtl">
                {row.degree_name_ar ?? "—"}
              </span>
            ),
          },
          {
            key: "degree_sort_order",
            label: "Sort Order",
            render: (row) => (
              <span className="text-sm text-muted-foreground">
                {row.degree_sort_order ?? "—"}
              </span>
            ),
          },
          {
            key: "actions",
            label: "",
            render: (row) => (
              <button
                type="button"
                className="text-xs px-2 py-1 rounded hover:bg-red-500/10 text-destructive"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (confirm(`Delete degree "${row.degree_name_en || "Unnamed"}"?`)) {
                    const result = await deleteDegree(row.degree_uuid);
                    if (result.operation === "error") {
                      alert(result.message);
                    }
                    router.refresh();
                  }
                }}
              >
                Delete
              </button>
            ),
          },
        ]}
      />
    </WorkspaceShell>
  );
}

/* ── Create form ────────────────────────────────────────────────── */

function CreateDegreeForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const nameEn = formData.get("nameEn") as string;
      try {
        const result = await createDegree(nameEn, "", "" as unknown as number, "");
        if (result.operation === "error") {
          return { error: result.message };
        }
        onSuccess();
        return { error: undefined };
      } catch (err) {
        return {
          error:
            err instanceof Error
              ? err.message
              : "Failed to create degree",
        };
      }
    },
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={action}
      className="flex flex-wrap items-end gap-3"
      onSubmit={() =>
        setTimeout(() => {
          formRef.current?.reset();
        }, 100)
      }
    >
      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          Degree name
        </label>
        <input
          name="nameEn"
          required
          maxLength={255}
          placeholder="e.g. Bachelor of Science"
          className="h-9 rounded-lg border px-3 text-sm"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--ink)",
          }}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="h-9 rounded-lg px-4 text-sm font-semibold bg-primary text-primary-foreground"
      >
        {pending ? "Adding..." : "Add"}
      </button>
      {state?.error ? (
        <p className="w-full text-xs text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}

/* ── Inline edit form ──────────────────────────────────────────── */

function EditDegreeForm({
  row,
  onDone,
  onCancel,
}: {
  row: DegreeItem;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const nameEn = formData.get("nameEn") as string;
      try {
        await updateDegree(row.degree_uuid, nameEn, undefined, undefined, undefined);
        onDone();
        return { error: undefined };
      } catch (err) {
        return {
          error:
            err instanceof Error
              ? err.message
              : "Failed to update degree",
        };
      }
    },
    null,
  );

  return (
    <form action={action} className="flex items-center gap-2">
      <input
        name="nameEn"
        defaultValue={row.degree_name_en ?? ""}
        required
        maxLength={255}
        className="h-8 w-40 rounded border px-2 text-sm"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--ink)",
        }}
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
