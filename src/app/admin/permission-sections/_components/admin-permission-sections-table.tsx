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
import type { PermissionSectionItem } from "../schemas";
import {
  createPermissionSection,
  updatePermissionSection,
  deletePermissionSection,
} from "../actions";

type Props = {
  session: SessionUser;
  sections: PermissionSectionItem[];
};

export function AdminPermissionSectionsTable({ session, sections }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Manage permission sections — groups that organise permissions in the system."
      metrics={[
        { label: "Total sections", value: sections.length, note: "Permission sections in the system" },
      ]}
    >
      <Card className="mb-6">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Add permission section</h3>
          <CreateSectionForm onSuccess={() => router.refresh()} />
        </CardContent>
      </Card>

      <DataTable
        title="Permission Sections"
        description="All permission sections. Click a section name to edit or delete."
        rows={sections.map((s) => ({ ...s, id: s.permissionUuid }))}
        rowHref={undefined}
        columns={[
          {
            key: "sectionName",
            label: "Section Name",
            render: (row) =>
              editingId === row.permissionUuid ? (
                <EditSectionForm
                  row={row}
                  onDone={() => { setEditingId(null); router.refresh(); }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <button
                  type="button"
                  className="text-sm hover:underline text-primary"
                  onClick={() => setEditingId(row.permissionUuid)}
                >
                  {row.sectionName ?? "—"}
                </button>
              ),
          },
          {
            key: "createdAt",
            label: "Created",
            render: (row) =>
              editingId === row.permissionUuid ? null : (
                <span className="text-sm text-muted-foreground">
                  {row.createdAt
                    ? new Date(row.createdAt).toLocaleDateString()
                    : "—"}
                </span>
              ),
          },
          {
            key: "actions",
            label: "",
            render: (row) =>
              editingId !== row.permissionUuid ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={async () => {
                    if (confirm(`Delete permission section "${row.sectionName ?? "unnamed"}?"`)) {
                      const result = await deletePermissionSection(row.permissionUuid);
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

function CreateSectionForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const sectionName = formData.get("sectionName") as string;
      const result = await createPermissionSection(
        { error: "" },
        formData,
      );
      if ("permissionUuid" in result && result.permissionUuid) {
        onSuccess();
        return { error: undefined };
      }
      return { error: (result as { error: string }).error ?? "Failed to create." };
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
        <Label htmlFor="section-name" className="text-xs font-medium text-muted-foreground">
          Section Name *
        </Label>
        <Input
          id="section-name"
          name="sectionName"
          required
          maxLength={255}
          placeholder="e.g. User Management"
          className="h-9 w-64"
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

function EditSectionForm({
  row, onDone, onCancel,
}: {
  row: PermissionSectionItem;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      formData.set("permissionUuid", row.permissionUuid);
      const result = await updatePermissionSection(
        { error: "" },
        formData,
      );
      if ("permissionUuid" in result && result.permissionUuid) {
        onDone();
        return { error: undefined };
      }
      return { error: (result as { error: string }).error ?? "Failed to update." };
    },
    null,
  );

  return (
    <form action={action} className="flex items-center gap-2 flex-wrap">
      <Input
        name="sectionName"
        defaultValue={row.sectionName ?? ""}
        required
        maxLength={255}
        className="h-8 w-48"
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
