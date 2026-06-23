"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { BlockedIpListItem } from "../schemas";
import { createBlockedIp, deleteBlockedIp } from "../actions";

type Props = {
  session: SessionUser;
  records: BlockedIpListItem[];
};

export function AdminBlockedIpsTable({ session, records }: Props) {
  const router = useRouter();

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Blocked IP addresses — restrict access by IP."
      metrics={[
        { label: "Blocked IPs", value: records.length, note: "IP addresses currently blocked" },
      ]}
    >
      <section className="mb-6">
        <div className="rounded-lg border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Block an IP</h3>
          <CreateBlockedIpForm onSuccess={() => router.refresh()} />
        </div>
      </section>

      <DataTable
        title="Blocked IP addresses"
        description="IPs that are prevented from accessing the system."
        searchable={true}
        rows={records.map((r) => ({ ...r, id: r.ip_uuid }))}
        rowHref={undefined}
        columns={[
          {
            key: "ip_address",
            label: "IP address",
            render: (row) => (
              <code className="text-sm font-mono text-foreground">
                {row.ip_address ?? "—"}
              </code>
            ),
          },
          {
            key: "note",
            label: "Note",
            render: (row) => (
              <span className="text-sm text-muted-foreground">
                {row.note ?? "—"}
              </span>
            ),
          },
          {
            key: "created_at",
            label: "Blocked at",
            render: (row) => (
              <span className="text-sm text-muted-foreground">
                {row.created_at
                  ? new Date(row.created_at).toLocaleDateString("en-KW", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "—"}
              </span>
            ),
          },
          {
            key: "actions",
            label: "",
            render: (row) => (
              <button
                type="button"
                className="text-xs px-2 py-1 rounded hover:bg-red-500/10 text-destructive"
                onClick={async () => {
                  if (confirm(`Unblock IP "${row.ip_address}"?`)) {
                    try {
                      await deleteBlockedIp(row.ip_uuid);
                      router.refresh();
                    } catch {
                      alert("Failed to unblock IP");
                    }
                  }
                }}
              >
                Unblock
              </button>
            ),
          },
        ]}
      />
    </WorkspaceShell>
  );
}

function CreateBlockedIpForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const ip_address = formData.get("ip_address") as string;
      const note = formData.get("note") as string;

      try {
        await createBlockedIp({ ip_address, note: note || undefined });
        onSuccess();
        return { error: undefined };
      } catch (e) {
        return { error: e instanceof Error ? e.message : "Failed to block IP" };
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
      onSubmit={() => setTimeout(() => { formRef.current?.reset(); }, 100)}
    >
      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted-foreground">IP address</label>
        <input
          name="ip_address"
          required
          maxLength={45}
          placeholder="e.g. 192.168.1.1"
          className="h-9 rounded-lg px-3 text-sm border bg-card border-border text-foreground"
        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted-foreground">Note (optional)</label>
        <input
          name="note"
          maxLength={255}
          placeholder="Reason for blocking"
          className="h-9 rounded-lg px-3 text-sm border bg-card border-border text-foreground"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="h-9 rounded-lg px-4 text-sm font-semibold bg-primary text-primary-foreground"
      >
        {pending ? "Blocking..." : "Block IP"}
      </button>
      {state?.error ? (
        <p className="text-xs w-full text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
