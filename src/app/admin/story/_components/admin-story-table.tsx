"use client";

import { useActionState, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { StatusBadge } from "@/modules/workspace/StatusBadge";

import type { SessionUser } from "@/modules/auth/types";
import type { StoryItem } from "../schemas";
import { createStory, updateStory, deleteStory, listStoryStaff } from "../actions";

const STATUS_LABELS: Record<number, string> = {
  0: "Open",
  1: "In progress",
  2: "Completed",
  3: "Cancelled",
};

type Props = {
  session: SessionUser;
  stories: StoryItem[];
};

export function AdminStoryTable({ session, stories }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Manage stories — track candidate placement stories and their status."
      metrics={[
        {
          label: "Total stories",
          value: stories.length,
          note: "Stories in the system",
        },
      ]}
    >
      <section className="mb-6">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 border-l-4 border-l-[var(--sh-coral)]">
          <h3 className="text-sm font-semibold mb-3 text-[var(--ink)]">
            Add story
          </h3>
          <CreateStoryForm onSuccess={() => router.refresh()} />
        </div>
      </section>

      <DataTable
        title="Stories"
        description="All stories. Click a row to edit."
        rows={stories.map((s) => ({ ...s, id: s.story_uuid }))}
        rowHref={undefined}
        columns={[
          {
            key: "request_title",
            label: "Request",
            render: (row) =>
              editingId === row.story_uuid ? (
                <EditStoryForm
                  row={row}
                  onDone={() => {
                    setEditingId(null);
                    router.refresh();
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <span className="text-sm">
                  {row.request_position_title
                    ? `${row.request_position_title.substring(0, 40)}...`
                    : row.request_uuid.substring(0, 12) + "..."}
                </span>
              ),
          },
          {
            key: "staff_name",
            label: "Staff",
            render: (row) => (
              <span className="text-sm text-[var(--muted)]">
                {row.staff_name || "\u2014"}
              </span>
            ),
          },
          {
            key: "story_status",
            label: "Status",
            render: (row) => {
              const variant =
                row.story_status === 0 ? "warning"
                  : row.story_status === 1 ? "info"
                    : row.story_status === 2 ? "success"
                      : "neutral";
              return (
                <StatusBadge
                  variant={variant}
                  size="sm"
                  label={STATUS_LABELS[row.story_status] ?? String(row.story_status)}
                />
              );
            },
          },
          {
            key: "employees",
            label: "Employees",
            render: (row) => (
              <span className="text-sm">
                {row.number_of_employees ?? "—"}
              </span>
            ),
          },
          {
            key: "is_old",
            label: "Legacy",
            render: (row) => (
              <span className="text-xs text-[var(--muted)]">
                {row.is_old ? "Yes" : "No"}
              </span>
            ),
          },
          {
            key: "time_spent",
            label: "Time spent",
            render: (row) => (
              <span className="text-sm text-[var(--muted)]">
                {row.story_time_spent != null
                  ? `${row.story_time_spent}m`
                  : "\u2014"}
              </span>
            ),
          },
          {
            key: "updated",
            label: "Last updated",
            render: (row) => {
              if (!row.story_last_updated_at) return "—";
              return new Date(row.story_last_updated_at).toLocaleDateString();
            },
          },
          {
            key: "actions",
            label: "Actions",
            render: (row) =>
              editingId !== row.story_uuid ? (
                deletingId === row.story_uuid ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="text-xs text-[var(--muted)]">Delete?</span>
                    <button
                      type="button"
                      className="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                      onClick={async () => {
                        setDeletingId(null);
                        const result = await deleteStory(row.story_uuid);
                        if (result.operation === "error") {
                          // Surface error via a brief inline message
                          setDeletingId("__error__");
                        }
                        router.refresh();
                      }}
                    >
                      Yes, delete
                    </button>
                    <button
                      type="button"
                      className="text-xs px-2 py-1 rounded text-[var(--muted)] hover:text-[var(--ink)]"
                      onClick={() => setDeletingId(null)}
                    >
                      Cancel
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    className="text-xs px-2 py-1 rounded hover:bg-red-500/10 text-[var(--sh-error)]"
                    onClick={() => setDeletingId(row.story_uuid)}
                  >
                    Delete
                  </button>
                )
              ) : null,
          },
        ]}
      />
    </WorkspaceShell>
  );
}

function CreateStoryForm({ onSuccess }: { onSuccess: () => void }) {
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
  const [staffOptions, setStaffOptions] = useState<
    { staff_id: number; staff_name: string }[]
  >([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  const loadStaff = async () => {
    if (staffOptions.length > 0) return;
    setLoadingStaff(true);
    try {
      const staff = await listStoryStaff();
      setStaffOptions(staff);
    } catch {
      // silently handle
    } finally {
      setLoadingStaff(false);
    }
  };

  return (
    <form
      ref={formRef}
      action={action}
      className="flex flex-wrap items-end gap-3"
      onSubmit={() =>
        setTimeout(() => formRef.current?.reset(), 100)
      }
    >
      <div className="grid gap-1">
        <label className="text-xs font-medium text-[var(--muted)]">
          Request UUID
        </label>
        <input
          name="requestUuid"
          required
          placeholder="req-uuid-here"
          className="h-9 rounded-lg px-3 text-sm border min-w-[200px] bg-[var(--surface)] border-[var(--border)] text-[var(--ink)]"
        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium text-[var(--muted)]">
          Staff
        </label>
        <select
          name="staffId"
          onFocus={loadStaff}
          className="h-9 rounded-lg px-3 text-sm border min-w-[140px] bg-[var(--surface)] border-[var(--border)] text-[var(--ink)]"
        >
          <option value="">Select staff...</option>
          {loadingStaff && <option disabled>Loading...</option>}
          {staffOptions.map((s) => (
            <option key={s.staff_id} value={s.staff_id}>
              {s.staff_name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium text-[var(--muted)]">
          Employees
        </label>
        <input
          name="numberOfEmployees"
          type="number"
          min={1}
          placeholder="1"
          className="h-9 rounded-lg px-3 text-sm border w-[80px] bg-[var(--surface)] border-[var(--border)] text-[var(--ink)]"
        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium text-[var(--muted)]">
          Status
        </label>
        <select
          name="storyStatus"
          defaultValue="0"
          className="h-9 rounded-lg px-3 text-sm border w-[120px] bg-[var(--surface)] border-[var(--border)] text-[var(--ink)]"
        >
          <option value="0">Open</option>
          <option value="1">In progress</option>
          <option value="2">Completed</option>
          <option value="3">Cancelled</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="h-9 rounded-lg px-4 text-sm font-semibold bg-[var(--sh-coral)] text-white hover:bg-[var(--sh-coral-hover)]"
      >
        {pending ? "Adding..." : "Add"}
      </button>
      {state?.error ? (
        <p className="text-xs w-full text-[var(--sh-error)]">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

function EditStoryForm({
  row,
  onDone,
  onCancel,
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
      <input type="hidden" name="storyUuid" value={row.story_uuid} />
      <select
        name="storyStatus"
        defaultValue={row.story_status}
        className="h-8 rounded px-2 text-sm border w-[100px] bg-[var(--surface)] border-[var(--border)] text-[var(--ink)]"
      >
        <option value="0">Open</option>
        <option value="1">In progress</option>
        <option value="2">Completed</option>
        <option value="3">Cancelled</option>
      </select>
      <input
        name="numberOfEmployees"
        type="number"
        min={1}
        defaultValue={row.number_of_employees ?? ""}
        placeholder="Emp"
        className="h-8 rounded px-2 text-sm border w-[60px] bg-[var(--surface)] border-[var(--border)] text-[var(--ink)]"
      />
      <input
        name="storyTimeSpent"
        type="number"
        min={0}
        defaultValue={row.story_time_spent ?? ""}
        placeholder="Min"
        className="h-8 rounded px-2 text-sm border w-[60px] bg-[var(--surface)] border-[var(--border)] text-[var(--ink)]"
      />
      <label className="flex items-center gap-1 text-xs text-[var(--muted)]">
        <input
          name="isOld"
          type="checkbox"
          defaultChecked={row.is_old ?? false}
          value="true"
        />
        Legacy
      </label>
      <button
        type="submit"
        disabled={pending}
        className="h-8 rounded px-3 text-xs font-semibold bg-[var(--sh-coral)] text-white hover:bg-[var(--sh-coral-hover)]"
      >
        {pending ? "..." : "Save"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="h-8 rounded px-3 text-xs text-[var(--muted)] hover:text-[var(--ink)]"
      >
        Cancel
      </button>
      {state?.error ? (
        <p className="text-xs text-[var(--sh-error)]">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
