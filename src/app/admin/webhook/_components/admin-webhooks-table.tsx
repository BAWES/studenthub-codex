"use client";

import { useActionState, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Badge } from "@/components/ui/badge";

import type { SessionUser } from "@/modules/auth/types";
import type { WebhookItem } from "../schemas";
import { createWebhook, updateWebhook, deleteWebhook } from "../actions";

type Props = {
  session: SessionUser;
  webhooks: WebhookItem[];
};

const WEBHOOK_METHOD_OPTIONS = ["GET", "POST"] as const;

export function AdminWebhooksTable({ session, webhooks }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Manage webhooks — configure HTTP callbacks for system events."
      metrics={[
        { label: "Total webhooks", value: webhooks.length, note: "Webhooks in the system" },
      ]}
    >
      <section className="bg-[var(--surface)] border-[var(--border)] text-[var(--ink)] bg-[var(--surface)] border-[var(--border)] text-[var(--ink)] bg-[var(--surface)] border-[var(--border)] text-[var(--ink)] bg-[var(--surface)] border-[var(--border)] text-[var(--ink)] bg-[var(--surface)] border-[var(--border)] text-[var(--ink)] bg-[var(--surface)] border-[var(--border)] text-[var(--ink)] mb-6">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Add webhook</h3>
          <CreateWebhookForm onSuccess={() => router.refresh()} />
        </div>
      </section>

      <DataTable
        title="Webhooks"
        description="All webhooks. Click a row to edit or delete."
        rows={webhooks.map((w) => ({ ...w, id: w.webhook_id }))}
        rowHref={undefined}
        columns={[
          {
            key: "event",
            label: "Event",
            render: (row) =>
              editingId === row.webhook_id ? (
                <EditWebhookForm
                  row={row}
                  onDone={() => { setEditingId(null); router.refresh(); }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <button
                  type="button"
                  className="text-sm hover:underline text-primary"
                  onClick={() => setEditingId(row.webhook_id)}
                >
                  {row.event}
                </button>
              ),
          },
          {
            key: "endpoint",
            label: "Endpoint",
            render: (row) => (
              <span className="text-sm truncate max-w-[200px] inline-block align-middle text-muted-foreground">
                {row.endpoint}
              </span>
            ),
          },
          {
            key: "method",
            label: "Method",
            render: (row) => (
              <Badge variant="outline">
                {row.method ?? "—"}
              </span>
            ),
          },
          {
            key: "updated",
            label: "Last updated",
            render: (row) => {
              if (!row.updated_at) return "—";
              return new Date(row.updated_at).toLocaleDateString();
            },
          },
          {
            key: "created",
            label: "Created",
            render: (row) => {
              if (!row.created_at) return "—";
              return new Date(row.created_at).toLocaleDateString();
            },
          },
          {
            key: "actions",
            label: "Actions",
            render: (row) =>
              editingId !== row.webhook_id ? (
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded hover:bg-red-500/10 text-destructive"
                  onClick={async () => {
                    if (confirm(`Delete webhook "${row.event}"?`)) {
                      const result = await deleteWebhook(row.webhook_id);
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

function CreateWebhookForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const event = formData.get("event") as string;
      const endpoint = formData.get("endpoint") as string;
      const method = formData.get("method") as string;
      const result = await createWebhook(event, endpoint, method || undefined);
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
        <label className="text-xs font-medium text-muted-foreground">Event</label>
        <input
          name="event"
          required
          maxLength={50}
          placeholder="e.g. user.created"
          className="h-9 rounded-lg px-3 text-sm border"
          
        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted-foreground">Endpoint</label>
        <input
          name="endpoint"
          required
          maxLength={255}
          placeholder="https://hooks.example.com/notify"
          className="h-9 rounded-lg px-3 text-sm border"
          
        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted-foreground">Method</label>
        <select
          name="method"
          defaultValue="POST"
          className="h-9 rounded-lg px-3 text-sm border"
          
        >
          <option value="">No method</option>
          {WEBHOOK_METHOD_OPTIONS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="h-9 rounded-lg px-4 text-sm font-semibold bg-primary text-primary-foreground"
      >
        {pending ? "Adding..." : "Add"}
      </button>
      {state?.error ? (
        <p className="text-xs w-full text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}

function EditWebhookForm({
  row,
  onDone,
  onCancel,
}: {
  row: WebhookItem;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const event = formData.get("event") as string;
      const endpoint = formData.get("endpoint") as string;
      const method = formData.get("method") as string;
      const result = await updateWebhook(row.webhook_id, event, endpoint, method || undefined);
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
      <input
        name="event"
        defaultValue={row.event}
        required
        maxLength={50}
        className="h-8 rounded px-2 text-sm border w-32"
        
      />
      <input
        name="endpoint"
        defaultValue={row.endpoint}
        required
        maxLength={255}
        className="h-8 rounded px-2 text-sm border w-48"
        
      />
      <select
        name="method"
        defaultValue={row.method ?? ""}
        className="h-8 rounded px-2 text-sm border"
        
      >
        <option value="">No method</option>
        {WEBHOOK_METHOD_OPTIONS.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
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
        <p className="text-xs text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
