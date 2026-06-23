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
import type { UniversityListItem } from "../schemas";
import { createUniversity, updateUniversity, deleteUniversity } from "../actions";

type Props = {
  session: SessionUser;
  universities: UniversityListItem[];
};

export function AdminUniversityTable({ session, universities }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Manage universities — manage the list of schools and universities used across the platform."
      metrics={[
        { label: "Total universities", value: universities.length, note: "Universities in the system" },
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
        description="All universities. Click a row to edit or delete."
        rows={universities.map((u) => ({ ...u, id: u.university_id }))}
        rowHref={undefined}
        columns={[
          {
            key: "name_en",
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
                  className="text-sm hover:underline text-primary"
                  onClick={() => setEditingId(row.university_id)}
                >
                  {row.university_name_en}
                </button>
              ),
          },
          {
            key: "name_ar",
            label: "Arabic name",
            render: (row) => row.university_name_ar || "—",
          },
          {
            key: "actions",
            label: "Actions",
            render: (row) =>
              editingId !== row.university_id ? (
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded hover:bg-red-500/10 text-destructive"
                  onClick={async () => {
                    if (confirm(`Delete university "${row.university_name_en}"?`)) {
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
      const nameEn = formData.get("nameEn") as string;
      const nameAr = formData.get("nameAr") as string;
      try {
        await createUniversity({
          university_name_en: nameEn,
          university_name_ar: nameAr || undefined,
        });
        onSuccess();
        return { error: undefined };
      } catch (e: unknown) {
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
        <Label htmlFor="nameEn">English name *</Label>
        <Input
          id="nameEn"
          name="nameEn"
          required
          maxLength={100}
          placeholder="e.g. Kuwait University"
          className="w-56"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="nameAr">Arabic name</Label>
        <Input
          id="nameAr"
          name="nameAr"
          maxLength={100}
          placeholder="الاسم بالعربية"
          className="w-56"
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
          universityId: row.university_id,
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
        className="w-36 h-8"
      />
      <Input
        name="nameAr"
        defaultValue={row.university_name_ar ?? ""}
        maxLength={100}
        placeholder="Name (AR)"
        className="w-36 h-8"
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
