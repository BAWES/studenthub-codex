"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
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
import type { Route } from "next";

import type { SessionUser } from "@/modules/auth/types";
import type { TagListItem } from "@/modules/admin/tag/schemas";
import { createTag, deleteTag } from "@/modules/admin/tag/actions";

type Props = {
  session: SessionUser;
  records: TagListItem[];
};

export function AdminTagTable({ session, records }: Props) {
  const router = useRouter();

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Tags — manage tag records."
      metrics={[
        { label: "Tags", value: records.length, note: "Active tags" },
      ]}
    >
      <section className="mb-6">
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Add a tag</h3>
          <CreateTagForm onSuccess={() => router.refresh()} />
        </Card>
      </section>

      <DataTable
        title="Tags"
        description="List of all tag records."
        rows={records.map((r) => ({ ...r, id: String(r.tag_id) }))}
        rowHref={(row) => `/admin/tag/${row.tag_id}` as Route}
        columns={[
          {
            key: "tag_id",
            label: "ID",
            render: (row) => (
              <span className="text-sm text-muted-foreground">
                {row.tag_id}
              </span>
            ),
          },
          {
            key: "tag",
            label: "Tag Name",
            render: (row) => (
              <span className="text-sm font-medium text-foreground">
                {row.tag}
              </span>
            ),
          },
          {
            key: "actions",
            label: "",
            render: (row) => (
              <DeleteTagButton
                tagId={row.tag_id}
                tagName={row.tag}
                onDelete={async () => {
                  await deleteTag(row.tag_id);
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

function DeleteTagButton({
  tagId,
  tagName,
  onDelete,
}: {
  tagId: number;
  tagName: string;
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
          <AlertDialogTitle>Delete tag</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{tagName}</strong>? This action cannot be undone.
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
                setError("Failed to delete tag");
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

function CreateTagForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const tag = formData.get("tag") as string;

      try {
        await createTag({ tag });
        onSuccess();
        return { error: undefined };
      } catch (e) {
        return { error: e instanceof Error ? e.message : "Failed to create tag" };
      }
    },
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={action}
      className="flex gap-3 items-end"
      onSubmit={() => setTimeout(() => { formRef.current?.reset(); }, 100)}
    >
      <div className="grid gap-1 flex-1 max-w-xs">
        <Label className="text-xs font-medium text-muted-foreground">Tag name</Label>
        <Input name="tag" maxLength={128} placeholder="e.g. urgent" />
      </div>
      <Button
        type="submit"
        disabled={pending}
      >
        {pending ? "Adding..." : "Add Tag"}
      </Button>
      {state?.error ? (
        <p className="text-xs w-full text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
