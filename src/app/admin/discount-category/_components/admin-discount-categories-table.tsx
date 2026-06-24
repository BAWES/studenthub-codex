"use client";

import { useActionState, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

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
      <Card className="mb-6">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Add discount category</h3>
          <CreateDiscountCategoryForm onSuccess={() => router.refresh()} />
        </CardContent>
      </Card>

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
                <Button
                  type="button"
                  variant="ghost"
                  className="text-sm px-0 h-auto hover:underline"
                  onClick={() => setEditingId(row.category_id)}
                >
                  {row.name_en}
                </Button>
              ),
          },
          {
            key: "name_ar",
            label: "Name (AR)",
            render: (row) =>
              editingId === row.category_id ? null : (
                <span className="text-sm text-muted-foreground">
                  {row.name_ar || "—"}
                </span>
              ),
          },
          {
            key: "image",
            label: "Image",
            render: (row) => {
              if (editingId === row.category_id) return null;
              if (!row.image) return <span className="text-sm text-muted-foreground">—</span>;
              return (
                <a
                  href={row.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline text-primary"
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
                <Button
                  variant="destructive"
                  size="sm"
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
                </Button>
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
      <div className="grid gap-1.5">
        <Label htmlFor="name_en">Name (EN) *</Label>
        <Input
          id="name_en"
          name="name_en"
          required
          maxLength={255}
          placeholder="e.g. Student Discount"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="name_ar">Name (AR)</Label>
        <Input
          id="name_ar"
          name="name_ar"
          maxLength={255}
          placeholder="خصم الطلاب"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="image">Image URL</Label>
        <Input
          id="image"
          name="image"
          maxLength={255}
          placeholder="https://example.com/image.png"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Adding..." : "Add"}
      </Button>
      {state?.error ? (
        <p className="text-xs w-full text-destructive">{state.error}</p>
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
      <Input
        name="name_en"
        defaultValue={row.name_en}
        required
        maxLength={255}
        className="w-40"
      />
      <Input
        name="name_ar"
        defaultValue={row.name_ar ?? ""}
        maxLength={255}
        placeholder="Name (AR)"
        className="w-40"
      />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "..." : "Save"}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
        Cancel
      </Button>
      {state?.error ? (
        <p className="text-xs w-full text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
