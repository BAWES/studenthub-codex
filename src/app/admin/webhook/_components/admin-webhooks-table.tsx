"use client";

import { useActionState, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      <section className="mb-6">
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Add webhook</h3>
          <CreateWebhookForm onSuccess={() => router.refresh()} />
        </div>
      </section>

      <DataTable
        title="Webhooks"
        description="All webhooks. Click a row to edit or delete."
        searchable={true}
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
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-muted text-foreground">
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
                <Button
                  variant="destructive"
                  size="sm"
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
                </Button>
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
      <div className="grid gap-1.5">
        <Label htmlFor="webhook-event" className="text-xs font-medium text-muted-foreground">Event</Label>
        <Input
          id="webhook-event"
          name="event"
          required
          maxLength={50}
          placeholder="e.g. user.created"
          className="h-9"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="webhook-endpoint" className="text-xs font-medium text-muted-foreground">Endpoint</Label>
        <Input
          id="webhook-endpoint"
          name="endpoint"
          required
          maxLength={255}
          placeholder="https://hooks.example.com/notify"
          className="h-9"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="webhook-method" className="text-xs font-medium text-muted-foreground">Method</Label>
        <Select name="method" defaultValue="POST">
          <SelectTrigger id="webhook-method" className="h-9 w-28">
            <SelectValue placeholder="No method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No method</SelectItem>
            {WEBHOOK_METHOD_OPTIONS.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
      <Input
        name="event"
        defaultValue={row.event}
        required
        maxLength={50}
        className="h-8 w-32"
      />
      <Input
        name="endpoint"
        defaultValue={row.endpoint}
        required
        maxLength={255}
        className="h-8 w-48"
      />
      <Select name="method" defaultValue={row.method ?? ""}>
        <SelectTrigger className="h-8 w-28">
          <SelectValue placeholder="No method" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No method</SelectItem>
          {WEBHOOK_METHOD_OPTIONS.map((m) => (
            <SelectItem key={m} value={m}>{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>
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
