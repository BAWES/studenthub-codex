"use client";

import { useActionState, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { PermissionSectionDetail } from "../schemas";
import {
  createPermissionSection,
  updatePermissionSection,
} from "../actions";

type Props = {
  session: SessionUser;
  sections: PermissionSectionDetail[];
};

export function AdminPermissionsTable({ session, sections }: Props) {
  const router = useRouter();
  const [editingUuid, setEditingUuid] = useState<string | null>(null);

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Manage permission sections — organize access control across the platform."
      metrics={[
        {
          label: "Permission sections",
          value: sections.length,
          note: "Sections in the system",
        },
      ]}
    >
      <section className="mb-6">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <h3
            className="mb-3 text-sm font-semibold text-foreground"
          >
            Add permission section
          </h3>
          <CreateSectionForm onSuccess={() => router.refresh()} />
        </div>
      </section>

      <DataTable
        title="Permission Sections"
        description="All permission sections. Click a section name to edit."
        rows={sections.map((s) => ({ ...s, id: s.permission_uuid }))}
        rowHref={undefined}
        columns={[
          {
            key: "permission_uuid",
            label: "UUID",
            render: (row) => (
              <span
                className="font-mono text-sm text-muted-foreground"
              >
                {row.permission_uuid.slice(0, 8)}...
              </span>
            ),
          },
          {
            key: "section_name",
            label: "Section name",
            render: (row) =>
              editingUuid === row.permission_uuid ? (
                <EditSectionForm
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
                  onClick={() => setEditingUuid(row.permission_uuid)}
                >
                  {row.section_name ?? "—"}
                </button>
              ),
          },
          {
            key: "created_at",
            label: "Created",
            render: (row) => {
              if (!row.created_at) return "—";
              return new Date(row.created_at).toLocaleDateString();
            },
          },
        ]}
      />
    </WorkspaceShell>
  );
}

/* ── Create form ────────────────────────────────────────────────── */

function CreateSectionForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const sectionName = formData.get("sectionName") as string;
      try {
        await createPermissionSection({ section_name: sectionName });
        onSuccess();
        return { error: undefined };
      } catch (err) {
        return {
          error:
            err instanceof Error
              ? err.message
              : "Failed to create permission section",
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
        <label
          className="text-xs font-medium text-muted-foreground"
        >
          Section name
        </label>
        <input
          name="sectionName"
          required
          maxLength={255}
          placeholder="e.g. Manage Users"
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
        <p className="w-full text-xs text-destructive">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

/* ── Inline edit form ──────────────────────────────────────────── */

function EditSectionForm({
  row,
  onDone,
  onCancel,
}: {
  row: PermissionSectionDetail;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const sectionName = formData.get("sectionName") as string;
      try {
        await updatePermissionSection({
          permission_uuid: row.permission_uuid,
          section_name: sectionName,
        });
        onDone();
        return { error: undefined };
      } catch (err) {
        return {
          error:
            err instanceof Error
              ? err.message
              : "Failed to update permission section",
        };
      }
    },
    null,
  );

  return (
    <form action={action} className="flex items-center gap-2">
      <input
        name="sectionName"
        defaultValue={row.section_name ?? ""}
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
        <p className="text-xs text-destructive">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
