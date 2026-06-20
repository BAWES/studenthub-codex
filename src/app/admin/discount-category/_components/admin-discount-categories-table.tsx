"use client";

import { useActionState, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { DiscountCategoryItem } from "../schemas";
import { createDiscountCategory, updateDiscountCategory, deleteDiscountCategory } from "../actions";

type Props = {
  session: SessionUser;
  categories: DiscountCategoryItem[];
};

export function AdminDiscountCategoriesTable({ session, categories }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Manage discount categories — organize discounts with reusable categories across the system."
      metrics={[
        { label: "Total categories", value: categories.length, note: "Discount categories in the system" },
      ]}
    >
      <section className="mb-6">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--ink)" }}>Add discount category</h3>
          <CreateDiscountCategoryForm onSuccess={() => router.refresh()} />
        </div>
      </section>

      <DataTable
        title="Discount Categories"
        description="All discount categories. Click a row to edit or delete."
        rows={categories.map((c) => ({ ...c, id: c.category_id }))}
        rowHref={undefined}
        columns={[
          {
            key: "name_en",
            label: "Name (EN)",
            render: (row) =>
              editingId === row.category_id ? (
                <EditDiscountCategoryForm
                  row={row}
                  onDone={() => { setEditingId(null); router.refresh(); }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <button
                  type="button"
                  className="text-sm hover:underline"
                  style={{ color: "var(--sh-primary)" }}
                  onClick={() => setEditingId(row.category_id)}
                >
                  {row.name_en}
                </button>
              ),
          },
          {
            key: "name_ar",
            label: "Name (AR)",
            render: (row) =>
              editingId === row.category_id ? null : (
                <span className="text-sm" style={{ color: "var(--muted)" }}>
                  {row.name_ar || "—"}
                </span>
              ),
          },
          {
            key: "image",
            label: "Image",
            render: (row) => {
              if (editingId === row.category_id) return null;
              if (!row.image) return <span className="text-sm" style={{ color: "var(--muted)" }}>—</span>;
              return (
                <a
                  href={row.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline"
                  style={{ color: "var(--sh-primary)" }}
                >
                  View
                </a>
              );
            },
          },
          {
            key: "updated",
            label: "Last updated",
            render: (row) => {
              if (!row.updated_at) return "—";
              return new Date(row.updated_at).toLocaleDateString();
            },
          },
          {
            key: "created",
            label: "Created",
            render: (row) => {
              if (!row.created_at) return "—";
              return new Date(row.created_at).toLocaleDateString();
            },
          },
          {
            key: "actions",
            label: "Actions",
            render: (row) =>
              editingId !== row.category_id ? (
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded hover:bg-red-500/10"
                  style={{ color: "var(--sh-error)" }}
                  onClick={async () => {
                    if (confirm(`Delete discount category "${row.name_en}"?`)) {
                      const result = await deleteDiscountCategory(row.category_id);
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

function CreateDiscountCategoryForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const name_en = formData.get("name_en") as string;
      const name_ar = formData.get("name_ar") as string | null;
      const image = formData.get("image") as string | null;
      const result = await createDiscountCategory(
        name_en,
        name_ar || null,
        image || null,
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
        <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Name (EN) *</label>
        <input
          name="name_en"
          required
          maxLength={255}
          placeholder="e.g. Student Discount"
          className="h-9 rounded-lg px-3 text-sm border"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Name (AR)</label>
        <input
          name="name_ar"
          maxLength={255}
          placeholder="خصم الطلاب"
          className="h-9 rounded-lg px-3 text-sm border"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Image URL</label>
        <input
          name="image"
          maxLength={255}
          placeholder="https://example.com/image.png"
          className="h-9 rounded-lg px-3 text-sm border"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
        />
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

function EditDiscountCategoryForm({
  row,
  onDone,
  onCancel,
}: {
  row: DiscountCategoryItem;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const name_en = formData.get("name_en") as string;
      const name_ar = formData.get("name_ar") as string | null;
      const image = formData.get("image") as string | null;
      const result = await updateDiscountCategory(
        row.category_id,
        name_en,
        name_ar || null,
        image || null,
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
    <form action={action} className="flex items-center gap-2">
      <input
        name="name_en"
        defaultValue={row.name_en}
        required
        maxLength={255}
        className="h-8 rounded px-2 text-sm border w-40"
        style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
      />
      <input
        name="name_ar"
        defaultValue={row.name_ar ?? ""}
        maxLength={255}
        placeholder="Name (AR)"
        className="h-8 rounded px-2 text-sm border w-40"
        style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
      />
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
