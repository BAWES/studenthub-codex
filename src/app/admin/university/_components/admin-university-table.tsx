"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

import type { SessionUser } from "@/modules/auth/types";
import type { UniversityListItem } from "../schemas";
import { createUniversity, deleteUniversity } from "../actions";

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
      title="Universities — manage institution records."
      metrics={[
        { label: "Universities", value: records.length, note: "Active institutions" },
      ]}
    >
      <Card className="mb-6">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Add a university</h3>
          <CreateUniversityForm onSuccess={() => router.refresh()} />
        </CardContent>
      </Card>

      <DataTable
        title="Universities"
        description="List of all active university records."
        rows={records.map((r) => ({ ...r, id: String(r.university_id) }))}
        rowHref={undefined}
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
            key: "candidate_count",
            label: "Candidates",
            render: (row) => (
              <span className="text-sm text-muted-foreground">
                {row.candidate_count ?? "—"}
              </span>
            ),
          },
          {
            key: "actions",
            label: "",
            render: (row) => (
              <Button
                variant="destructive"
                size="sm"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (confirm(`Delete university "${row.university_name_en || row.university_name_ar || "Unnamed"}"?`)) {
                    try {
                      await deleteUniversity(row.university_id);
                      router.refresh();
                    } catch {
                      alert("Failed to delete university");
                    }
                  }
                }}
              >
                Delete
              </Button>
            ),
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
          university_name_en: university_name_en || undefined,
          university_name_ar: university_name_ar || undefined,
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
        <Label htmlFor="uni-name-en" className="text-xs font-medium text-muted-foreground">Name (English)</Label>
        <Input
          id="uni-name-en"
          name="university_name_en"
          maxLength={100}
          placeholder="e.g. Kuwait University"
          className="h-9 w-56"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="uni-name-ar" className="text-xs font-medium text-muted-foreground">Name (Arabic)</Label>
        <Input
          id="uni-name-ar"
          name="university_name_ar"
          maxLength={100}
          placeholder="مثال: جامعة الكويت"
          className="h-9 w-48"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Adding..." : "Add University"}
      </Button>
      {state?.error ? (
        <p className="text-xs font-medium text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
