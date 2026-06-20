"use client";

import { useActionState, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

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
      <Card className="mb-6">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold mb-3 text-foreground">New campaign</h3>
          <CreateCampaignForm onSuccess={() => router.refresh()} />
        </CardContent>
      </Card>

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
                <Badge variant={row.status ? "default" : "secondary"}>
                  {row.status ? "Active" : "Inactive"}
                </Badge>
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
      <div className="grid gap-1.5">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          name="subject"
          required
          maxLength={255}
          placeholder="e.g. New opportunity at..."
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="message">Message</Label>
        <Input
          id="message"
          name="message"
          placeholder="Campaign message body"
          className="w-80"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="target">Target</Label>
        <select
          id="target"
          name="target"
          defaultValue="both"
          className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="both">Both</option>
          <option value="candidate">Candidate</option>
          <option value="customer">Customer</option>
        </select>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Creating..." : "Create"}
      </Button>
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
      <Input
        name="subject"
        defaultValue={row.subject ?? ""}
        maxLength={255}
        className="w-44 h-8"
      />
      <Input
        name="message"
        defaultValue={row.message ?? ""}
        placeholder="Message"
        className="w-48 h-8"
      />
      <select
        name="target"
        defaultValue={row.target ?? "both"}
        className="flex h-8 rounded border border-input bg-transparent px-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "..." : "Save"}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
        Cancel
      </Button>
      {state?.error ? (
        <p className="text-xs w-full text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
