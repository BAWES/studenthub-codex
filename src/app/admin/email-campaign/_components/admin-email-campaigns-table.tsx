"use client";

import { useActionState, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { EmailCampaignListItem } from "../schemas";
import {
  createEmailCampaign,
  updateEmailCampaign,
} from "../actions";

type Props = {
  session: SessionUser;
  campaigns: EmailCampaignListItem[];
};

export function AdminEmailCampaignsTable({ session, campaigns }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Manage email campaigns — create and send targeted email campaigns to candidates."
      metrics={[
        { label: "Total campaigns", value: campaigns.length, note: "Email campaigns in the system" },
        { label: "Active", value: campaigns.filter((c) => c.status).length, note: "Campaigns currently active" },
      ]}
    >
      <section className="mb-6">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <h3 className="text-sm font-semibold mb-3 text-foreground">New campaign</h3>
          <CreateCampaignForm onSuccess={() => router.refresh()} />
        </div>
      </section>

      <DataTable
        title="Email campaigns"
        description="All email campaigns. Click a campaign name to edit details."
        rows={campaigns.map((c) => ({ ...c, id: c.campaign_uuid }))}
        rowHref={undefined}
        columns={[
          {
            key: "subject",
            label: "Subject",
            render: (row) =>
              editingId === row.campaign_uuid ? (
                <EditCampaignForm
                  row={row}
                  onDone={() => { setEditingId(null); router.refresh(); }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <button
                  type="button"
                  className="text-sm hover:underline text-left text-primary"
                  onClick={() => setEditingId(row.campaign_uuid)}
                >
                  {row.subject ?? "(no subject)"}
                </button>
              ),
          },
          {
            key: "target",
            label: "Target",
            render: (row) =>
              editingId === row.campaign_uuid ? null : (
                <span className="text-sm text-foreground">
                  {row.target ?? "—"}
                </span>
              ),
          },
          {
            key: "progress",
            label: "Progress",
            render: (row) =>
              editingId === row.campaign_uuid ? null : (
                <span className="text-sm font-medium text-foreground">
                  {row.progress != null ? `${row.progress}%` : "—"}
                </span>
              ),
          },
          {
            key: "status",
            label: "Status",
            render: (row) =>
              editingId === row.campaign_uuid ? null : (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: row.status
                      ? "rgba(34, 197, 94, 0.12)"
                      : "rgba(156, 163, 175, 0.2)",
                    color: row.status
                      ? "rgb(34, 197, 94)"
                      : "var(--muted)",
                  }}
                >
                  {row.status ? "Active" : "Inactive"}
                </span>
              ),
          },
          {
            key: "created",
            label: "Created",
            render: (row) =>
              editingId === row.campaign_uuid ? null : (
                <span className="text-sm text-muted-foreground">
                  {row.created_at
                    ? new Date(row.created_at).toLocaleDateString()
                    : "—"}
                </span>
              ),
          },
        ]}
      />
    </WorkspaceShell>
  );
}

function CreateCampaignForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const subject = formData.get("subject") as string;
      const message = formData.get("message") as string;
      const target = formData.get("target") as string;

      const result = await createEmailCampaign({
        subject: subject || undefined,
        message: message || undefined,
        target: target || undefined,
      });
      if (result.operation === "success") {
        onSuccess();
        return { error: undefined };
      }
      return { error: result.message ?? "Failed to create campaign" };
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
        <label className="text-xs font-medium text-muted-foreground">Subject</label>
        <input
          name="subject"
          required
          maxLength={255}
          placeholder="e.g. New opportunity at..."
          className="h-9 rounded-lg px-3 text-sm border"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted-foreground">Message</label>
        <input
          name="message"
          placeholder="Campaign message body"
          className="h-9 rounded-lg px-3 text-sm border w-80"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted-foreground">Target</label>
        <select
          name="target"
          defaultValue="both"
          className="h-9 rounded-lg px-3 text-sm border"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
        >
          <option value="both">Both</option>
          <option value="candidate">Candidate</option>
          <option value="customer">Customer</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="h-9 rounded-lg px-4 text-sm font-semibold bg-primary text-primary-foreground"
      >
        {pending ? "Creating..." : "Create"}
      </button>
      {state?.error ? (
        <p className="text-xs w-full text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}

function EditCampaignForm({
  row,
  onDone,
  onCancel,
}: {
  row: EmailCampaignListItem;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const subject = formData.get("subject") as string;
      const message = formData.get("message") as string;
      const target = formData.get("target") as string;
      const status = formData.get("status") === "active";

      const result = await updateEmailCampaign({
        campaignUuid: row.campaign_uuid,
        subject: subject || undefined,
        message: message || undefined,
        target: target || undefined,
        status,
      });
      if (result.operation === "success") {
        onDone();
        return { error: undefined };
      }
      return { error: result.message ?? "Failed to update campaign" };
    },
    null,
  );

  return (
    <form action={action} className="flex items-center gap-2 flex-wrap">
      <input
        name="subject"
        defaultValue={row.subject ?? ""}
        maxLength={255}
        className="h-8 rounded px-2 text-sm border w-44"
        style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
      />
      <input
        name="message"
        defaultValue={row.message ?? ""}
        placeholder="Message"
        className="h-8 rounded px-2 text-sm border w-48"
        style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
      />
      <select
        name="target"
        defaultValue={row.target ?? "both"}
        className="h-8 rounded px-2 text-sm border"
        style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
      >
        <option value="both">Both</option>
        <option value="candidate">Candidate</option>
        <option value="customer">Customer</option>
      </select>
      <label className="flex items-center gap-1 text-xs text-muted-foreground">
        <input
          name="status"
          type="checkbox"
          value="active"
          defaultChecked={row.status ?? false}
          className="h-4 w-4"
        />
        Active
      </label>
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
        <p className="text-xs w-full text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
