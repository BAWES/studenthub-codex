"use client";

import { useActionState, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { StoryItem } from "../schemas";
import { createStory, updateStory, deleteStory } from "../actions";

type Props = {
  session: SessionUser;
  stories: StoryItem[];
};

export function AdminStoryTable({ session, stories }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Manage stories — track staffing requests and placement progress."
      metrics={[
        { label: "Total stories", value: stories.length, note: "Stories in the system" },
      ]}
    >
      <section className="mb-6">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--ink)" }}>Add story</h3>
          <CreateStoryForm onSuccess={() => router.refresh()} />
        </div>
      </section>

      <DataTable
        title="Stories"
        description="All staffing stories. Click a row field to edit or delete."
        rows={stories.map((s) => ({ ...s, id: s.story_uuid }))}
        rowHref={undefined}
        columns={[
          {
            key: "position",
            label: "Position",
            render: (row) => (
              <span className="text-sm" style={{ color: "var(--ink)" }}>
                {row.request_position_title ?? "—"}
              </span>
            ),
          },
          {
            key: "staff",
            label: "Staff",
            render: (row) =>
              editingId === row.story_uuid ? (
                <EditStoryForm
                  row={row}
                  onDone={() => { setEditingId(null); router.refresh(); }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <button
                  type="button"
                  className="text-sm hover:underline"
                  style={{ color: "var(--sh-primary)" }}
                  onClick={() => setEditingId(row.story_uuid)}
                >
                  {row.staff_name ?? "—"}
                </button>
              ),
          },
          {
            key: "employees",
            label: "Employees",
            render: (row) =>
              editingId === row.story_uuid ? null : (
                <span className="text-sm" style={{ color: "var(--ink)" }}>
                  {row.number_of_employees ?? "—"}
                </span>
              ),
          },
          {
            key: "status",
            label: "Status",
            render: (row) =>
              editingId === row.story_uuid ? null : (
                <span className="text-sm" style={{ color: "var(--muted)" }}>
                  {row.story_status === 1 ? "Active" : row.story_status === 2 ? "Closed" : "Draft"}
                </span>
              ),
          },
          {
            key: "updated",
            label: "Updated",
            render: (row) =>
              editingId === row.story_uuid ? null : (
                <span className="text-sm" style={{ color: "var(--muted)" }}>
                  {row.story_last_updated_at
                    ? new Date(row.story_last_updated_at).toLocaleDateString()
                    : "—"}
                </span>
              ),
          },
          {
            key: "actions",
            label: "",
            render: (row) =>
              editingId !== row.story_uuid ? (
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded hover:bg-red-500/10"
                  style={{ color: "var(--sh-error)" }}
                  onClick={async () => {
                    if (confirm(`Delete story for "${row.request_position_title ?? "unknown position"}"?`)) {
                      const result = await deleteStory(row.story_uuid);
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

function CreateStoryForm({ onSuccess }: { onSuccess: () => void }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const result = await createStory(null, formData);
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
        <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Request UUID *</label>
        <input name="requestUuid" required placeholder="e.g. req-abc-123"
          className="h-9 rounded-lg px-3 text-sm border w-56"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }} />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Staff ID</label>
        <input name="staffId" type="number" placeholder="Optional"
          className="h-9 rounded-lg px-3 text-sm border w-24"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }} />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Employees</label>
        <input name="numberOfEmployees" type="number" placeholder="#"
          className="h-9 rounded-lg px-3 text-sm border w-20"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }} />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Status</label>
        <select name="storyStatus"
          className="h-9 rounded-lg px-3 text-sm border"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}>
          <option value="0">Draft</option>
          <option value="1">Active</option>
          <option value="2">Closed</option>
        </select>
      </div>
      <button
        type="submit" disabled={pending}
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

function EditStoryForm({
  row, onDone, onCancel,
}: {
  row: StoryItem;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      formData.set("storyUuid", row.story_uuid);
      const result = await updateStory(null, formData);
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
      <input name="requestUuid" defaultValue={row.request_uuid} required
        className="h-8 rounded px-2 text-sm border w-40"
        style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }} />
      <input name="staffId" type="number" defaultValue={row.staff_id ?? ""} placeholder="Staff ID"
        className="h-8 rounded px-2 text-sm border w-24"
        style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }} />
      <input name="numberOfEmployees" type="number" defaultValue={row.number_of_employees ?? ""} placeholder="#"
        className="h-8 rounded px-2 text-sm border w-20"
        style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }} />
      <select name="storyStatus" defaultValue={row.story_status}
        className="h-8 rounded px-2 text-sm border"
        style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}>
        <option value="0">Draft</option>
        <option value="1">Active</option>
        <option value="2">Closed</option>
      </select>
      <input name="isOld" type="checkbox" defaultChecked={row.is_old ?? false} className="hidden" />
      <input name="storyTimeSpent" type="number" defaultValue={row.story_time_spent ?? ""} placeholder="Time"
        className="h-8 rounded px-2 text-sm border w-16"
        style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }} />
      <button type="submit" disabled={pending}
        className="h-8 rounded px-3 text-xs font-semibold"
        style={{ background: "var(--sh-primary)", color: "#fff" }}>
        {pending ? "..." : "Save"}
      </button>
      <button type="button" onClick={onCancel}
        className="h-8 rounded px-3 text-xs" style={{ color: "var(--muted)" }}>
        Cancel
      </button>
      {state?.error ? (
        <p className="text-xs w-full" style={{ color: "var(--sh-error)" }}>{state.error}</p>
      ) : null}
    </form>
  );
}
