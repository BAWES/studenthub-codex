"use client";

import { useActionState, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

import type { SessionUser } from "@/modules/auth/types";
import type { MajorItem } from "../schemas";
import { createMajor, updateMajor, deleteMajor } from "../actions";

type Props = {
  session: SessionUser;
  majors: MajorItem[];
};

export function AdminMajorsTable({ session, majors }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Manage majors — fields of study candidates can select."
      metrics={[
        { label: "Total majors", value: majors.length, note: "Majors in the system" },
      ]}
    >
      <Card className="mb-6">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Add major</h3>
          <CreateMajorForm onSuccess={() => router.refresh()} />
        </CardContent>
      </Card>

      <DataTable
        title="Majors"
        description="All fields of study. Click a major name to edit or delete."
        rows={majors.map((m) => ({ ...m, id: m.major_uuid }))}
        rowHref={undefined}
        columns={[
          {
            key: "name_en",
            label: "Name (EN)",
            render: (row) =>
              editingId === row.major_uuid ? (
                <EditMajorForm
                  row={row}
                  onDone={() => { setEditingId(null); router.refresh(); }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <button
                  type="button"
                  className="text-sm hover:underline text-primary"
                  onClick={() => setEditingId(row.major_uuid)}
                >
                  {row.major_name_en}
                </button>
              ),
          },
          {
            key: "name_ar",
            label: "Name (AR)",
            render: (row) =>
              editingId === row.major_uuid ? null : (
                <span className="text-sm text-foreground">
                  {row.major_name_ar}
                </span>
              ),
          },
          {
            key: "updated",
            label: "Updated",
            render: (row) =>
              editingId === row.major_uuid ? null : (
                <span className="text-sm text-muted-foreground">
                  {row.major_updated_at
                    ? new Date(row.major_updated_at).toLocaleDateString()
                    : "—"}
                </span>
              ),
          },
          {
            key: "actions",
            label: "",
            render: (row) =>
              editingId !== row.major_uuid ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={async () => {
                    if (confirm(`Delete major "${row.major_name_en}"?`)) {
                      const result = await deleteMajor(row.major_uuid);
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

function CreateMajorForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const nameEn = formData.get("majorNameEn") as string;
      const nameAr = formData.get("majorNameAr") as string;
      const result = await createMajor(nameEn, nameAr);
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
        <Label htmlFor="major-name-en" className="text-xs font-medium text-muted-foreground">Name (EN) *</Label>
        <Input
          id="major-name-en"
          name="majorNameEn"
          required
          maxLength={150}
          placeholder="e.g. Computer Science"
          className="h-9 w-48"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="major-name-ar" className="text-xs font-medium text-muted-foreground">Name (AR) *</Label>
        <Input
          id="major-name-ar"
          name="majorNameAr"
          required
          maxLength={150}
          placeholder="علوم الحاسوب"
          className="h-9 w-36"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Adding..." : "Add"}
      </Button>
      {state?.error ? (
        <Alert variant="destructive" className="w-full mt-2">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
    </form>
  );
}

function EditMajorForm({
  row, onDone, onCancel,
}: {
  row: MajorItem;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const nameEn = formData.get("majorNameEn") as string;
      const nameAr = formData.get("majorNameAr") as string;
      const result = await updateMajor(row.major_uuid, nameEn, nameAr);
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
      <Input
        name="majorNameEn"
        defaultValue={row.major_name_en}
        required
        maxLength={150}
        className="h-8 w-40"
      />
      <Input
        name="majorNameAr"
        defaultValue={row.major_name_ar}
        required
        maxLength={150}
        className="h-8 w-36"
      />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "..." : "Save"}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
        Cancel
      </Button>
      {state?.error ? (
        <Alert variant="destructive" className="w-full mt-2">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
    </form>
  );
}
