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
import type { UniversityListItem } from "@/modules/admin/university/schemas";
import { createUniversity, updateUniversity, deleteUniversity } from "@/modules/admin/university/actions";

type Props = {
  session: SessionUser;
  records: UniversityListItem[];
};

export function AdminUniversityTable({ session, records }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Universities — manage university records."
      metrics={[
        { label: "Universities", value: records.length, note: "Active universities" },
      ]}
    >
      <Card className="mb-6">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Add university</h3>
          <CreateUniversityForm onSuccess={() => router.refresh()} />
        </CardContent>
      </Card>

      <DataTable
        title="Universities"
        description="All universities. Click a name to edit in-line."
        rows={records.map((r) => ({ ...r, id: String(r.university_id) }))}
        columns={[
          {
            key: "university_name_en",
            label: "Name (English)",
            render: (row) =>
              editingId === row.university_id ? (
                <EditUniversityForm
                  row={row as unknown as UniversityListItem}
                  onDone={() => { setEditingId(null); router.refresh(); }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <button
                  type="button"
                  className="text-sm hover:underline text-primary"
                  onClick={() => setEditingId(row.university_id)}
                >
                  {row.university_name_en ?? "—"}
                </button>
              ),
          },
          {
            key: "university_name_ar",
            label: "Name (Arabic)",
            render: (row) => (
              <span className="text-sm text-muted-foreground" dir="rtl">
                {row.university_name_ar ?? "—"}
              </span>
            ),
          },
          {
            key: "university_data_source",
            label: "Data Source",
            render: (row) => (
              <span className="text-sm text-muted-foreground">
                {row.university_data_source ?? "—"}
              </span>
            ),
          },
          {
            key: "actions",
            label: "Delete",
            render: (row) =>
              editingId !== row.university_id ? (
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded hover:bg-red-500/10 text-destructive"
                  onClick={async () => {
                    if (confirm(`Delete university "${row.university_name_en ?? "Unnamed"}"?`)) {
                      await deleteUniversity(row.university_id);
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
      const university_name_en = formData.get("university_name_en") as string;
      const university_name_ar = formData.get("university_name_ar") as string;

      try {
        await createUniversity({
          university_name_en: university_name_en || "",
          university_name_ar: university_name_ar || "",
        });
        onSuccess();
        return { error: undefined };
      } catch (e) {
        return { error: e instanceof Error ? e.message : "Failed to create university" };
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
      onSubmit={() => setTimeout(() => { formRef.current?.reset(); }, 100)}
    >
      <div className="grid gap-1.5">
        <Label htmlFor="university_name_en">Name (English)</Label>
        <Input
          id="university_name_en"
          name="university_name_en"
          maxLength={100}
          placeholder="e.g. Kuwait University"
          className="w-60"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="university_name_ar">Name (Arabic)</Label>
        <Input
          id="university_name_ar"
          name="university_name_ar"
          maxLength={100}
          placeholder="مثال: جامعة الكويت"
          className="w-60"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Adding..." : "Add University"}
      </Button>
      {state?.error ? (
        <p className="text-xs w-full text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}

function EditUniversityForm({
  row,
  onDone,
  onCancel,
}: {
  row: UniversityListItem;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const nameEn = formData.get("nameEn") as string;
      const nameAr = formData.get("nameAr") as string;
      try {
        await updateUniversity({
          university_id: row.university_id,
          university_name_en: nameEn,
          university_name_ar: nameAr || undefined,
        });
        onDone();
        return { error: undefined };
      } catch (e: unknown) {
        return { error: e instanceof Error ? e.message : "Failed to update university" };
      }
    },
    null,
  );

  return (
    <form action={action} className="flex items-center gap-2 flex-wrap">
      <Input
        name="nameEn"
        defaultValue={row.university_name_en ?? ""}
        required
        maxLength={100}
        className="w-28 h-8"
      />
      <Input
        name="nameAr"
        defaultValue={row.university_name_ar ?? ""}
        maxLength={100}
        placeholder="Name (AR)"
        className="w-28 h-8"
      />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "..." : "Save"}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
        Cancel
      </Button>
      {state?.error ? (
        <p className="text-xs text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
