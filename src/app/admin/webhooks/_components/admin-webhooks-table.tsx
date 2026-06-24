"use client";

import { useActionState, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

import type { SessionUser } from "@/modules/auth/types";
import type { WebhookListItem } from "../schemas";
import { createWebhook, updateWebhook, deleteWebhook } from "../actions";

type Props = {
  session: SessionUser;
  webhooks: WebhookListItem[];
};

export function AdminWebhooksTable({ session, webhooks }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Manage webhooks — configure HTTP callbacks for system events across the platform."
      metrics={[
        { label: "Total webhooks", value: webhooks.length, note: "Registered webhook endpoints" },
      ]}
    >
      <Card className="mb-6">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Add webhook</h3>
          <CreateWebhookForm onSuccess={() => router.refresh()} />
        </CardContent>
      </Card>

      <DataTable
        title="Webhooks"
        description="All configured webhooks. Click an event name to edit."
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
                  className="text-sm font-mono hover:underline text-primary"
                  onClick={() => setEditingId(row.webhook_id)}
                >
                  {row.event}
                </button>
              ),
          },
          {
            key: "endpoint",
            label: "Endpoint",
            render: (row) =>
              editingId === row.webhook_id ? null : (
                <span className="text-sm truncate max-w-[400px] inline-block align-middle" title={row.endpoint}>
                  {row.endpoint}
                </span>
              ),
          },
          {
            key: "method",
            label: "Method",
            render: (row) => {
              if (editingId === row.webhook_id) return null;
              return row.method ? (
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold text-white ${row.method === "POST" ? "bg-primary" : row.method === "GET" ? "bg-blue-500" : "bg-amber-500"}`}
                >
                  {row.method}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              );
            },
          },
          {
            key: "updated",
            label: "Last updated",
            render: (row) => {
              if (editingId === row.webhook_id) return null;
              if (!row.updated_at) return "—";
              return new Date(row.updated_at).toLocaleDateString();
            },
          },
          {
            key: "created",
            label: "Created",
            render: (row) => {
              if (editingId === row.webhook_id) return null;
              if (!row.created_at) return "—";
              return new Date(row.created_at).toLocaleDateString();
            },
          },
          {
            key: "actions",
            label: "",
            render: (row) =>
              editingId !== row.webhook_id ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={async () => {
                    if (confirm(`Delete webhook for "${row.event}"?`)) {
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

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

function CreateWebhookForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const event = formData.get("event") as string;
      const endpoint = formData.get("endpoint") as string;
      const method = formData.get("method") as string || undefined;
      const result = await createWebhook(event, endpoint, method);
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
        <Label htmlFor="event">Event *</Label>
        <Input id="event" name="event" required maxLength={50} placeholder="e.g. issue.created" className="w-44" />
      </div>
      <div className="grid gap-1">
        <Label htmlFor="endpoint">Endpoint *</Label>
        <Input id="endpoint" name="endpoint" required maxLength={255} placeholder="https://hooks.example.com/callback" className="w-72" />
      </div>
      <div className="grid gap-1">
        <Label htmlFor="method">Method</Label>
        <select id="method" name="method"
          className="h-9 rounded-lg px-3 text-sm border border-input bg-background text-foreground"
        >
          <option value="">Auto</option>
          {HTTP_METHODS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
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

function EditWebhookForm({
  row, onDone, onCancel,
}: {
  row: WebhookListItem;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const event = formData.get("event") as string;
      const endpoint = formData.get("endpoint") as string;
      const method = formData.get("method") as string || undefined;
      const result = await updateWebhook(row.webhook_id, event, endpoint, method);
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
        className="w-36"
      />
      <Input
        name="endpoint"
        defaultValue={row.endpoint}
        required
        maxLength={255}
        className="w-48"
      />
      <select name="method" defaultValue={row.method ?? ""}
        className="h-8 rounded px-2 text-sm border border-input bg-background text-foreground w-24"
      >
        <option value="">Auto</option>
        {HTTP_METHODS.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
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
