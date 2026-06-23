"use client";

import { useActionState, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import type { SessionUser } from "@/modules/auth/types";
import type { UniversityListItem } from "@/modules/admin/university/schemas";
import { createUniversity, deleteUniversity } from "@/modules/admin/university/actions";

type Props = {
  session: SessionUser;
  records: UniversityListItem[];
};

export function AdminUniversityTable({ session, records }: Props) {
  const router = useRouter();

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
        description="List of all university records. Click a name to view details."
        searchable={true}
        rows={records.map((r) => ({ ...r, id: String(r.university_id) }))}
        columns={[
          {
            key: "university_name_en",
            label: "Name (English)",
            render: (row) => (
              <span className="text-sm font-medium text-foreground">
                {row.university_name_en ?? "—"}
              </span>
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
            label: "",
            render: (row) => (
              <DeleteUniversityButton
                universityId={row.university_id}
                universityName={row.university_name_en || row.university_name_ar || "Unnamed"}
                onDelete={async () => {
                  await deleteUniversity(row.university_id);
                  router.refresh();
                }}
              />
            ),
          },
        ]}
      />
    </WorkspaceShell>
  );
}

function DeleteUniversityButton({
  universityId,
  universityName,
  onDelete,
}: {
  universityId: number;
  universityName: string;
  onDelete: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete university</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{universityName}</strong>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <p className="text-sm text-destructive font-medium">{error}</p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            onClick={async (e) => {
              e.preventDefault();
              setLoading(true);
              setError(null);
              try {
                await onDelete();
                setOpen(false);
              } catch {
                setError("Failed to delete university");
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
