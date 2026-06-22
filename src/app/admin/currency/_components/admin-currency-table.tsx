"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { CurrencyItem } from "../schemas";
import { createCurrency } from "../actions";

type Props = {
  session: SessionUser;
  records: CurrencyItem[];
  total: number;
};

export function AdminCurrencyTable({ session, records, total }: Props) {
  const router = useRouter();

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Currencies — manage exchange rates and currency codes."
      metrics={[
        { label: "Currencies", value: total, note: "Available currencies" },
      ]}
    >
      <section className="mb-6">
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Add a currency</h3>
          <CreateCurrencyForm onSuccess={() => router.refresh()} />
        </div>
      </section>

      <DataTable
        title="Currencies"
        description="Exchange rates and currency codes used across the platform."
        rows={records.map((r) => ({ ...r, id: String(r.currency_id) }))}
        rowHref={undefined}
        columns={[
          {
            key: "code",
            label: "Code",
            render: (row) => (
              <span className="text-sm font-semibold text-foreground">
                {row.code ?? "—"}
              </span>
            ),
          },
          {
            key: "title",
            label: "Name",
            render: (row) => (
              <span className="text-sm text-foreground">
                {row.title ?? "—"}
              </span>
            ),
          },
          {
            key: "currency_symbol",
            label: "Symbol",
            render: (row) => (
              <span className="text-sm font-mono text-muted-foreground">
                {row.currency_symbol ?? "—"}
              </span>
            ),
          },
          {
            key: "rate",
            label: "Rate",
            render: (row) => (
              <span className="text-sm text-muted-foreground">
                {row.rate != null ? row.rate.toFixed(4) : "—"}
              </span>
            ),
          },
          {
            key: "status",
            label: "Active",
            render: (row) => (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                  row.status
                    ? "bg-green-500/10 text-green-600"
                    : "bg-red-500/10 text-red-600"
                }`}
              >
                {row.status ? "Active" : "Inactive"}
              </span>
            ),
          },
          {
            key: "sort_order",
            label: "Sort",
            render: (row) => (
              <span className="text-sm text-muted-foreground">
                {row.sort_order ?? "—"}
              </span>
            ),
          },
        ]}
      />
    </WorkspaceShell>
  );
}

function CreateCurrencyForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const title = formData.get("title") as string;
      const code = formData.get("code") as string;
      const currencySymbol = formData.get("currencySymbol") as string;
      const rate = formData.get("rate") as string;

      try {
        await createCurrency({
          title,
          code,
          currencySymbol: currencySymbol || undefined,
          rate: rate ? parseFloat(rate) : undefined,
        });
        onSuccess();
        return { error: undefined };
      } catch (e) {
        return { error: e instanceof Error ? e.message : "Failed to create currency" };
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
        <label className="text-xs font-medium text-muted-foreground">Title</label>
        <input
          name="title"
          required
          maxLength={255}
          placeholder="e.g. Kuwaiti Dinar"
          className="h-9 rounded-lg px-3 text-sm border bg-background text-foreground border-border"        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted-foreground">Code</label>
        <input
          name="code"
          required
          maxLength={10}
          placeholder="e.g. KWD"
          className="h-9 rounded-lg px-3 text-sm border bg-background text-foreground border-border"        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted-foreground">Symbol</label>
        <input
          name="currencySymbol"
          maxLength={10}
          placeholder="e.g. د.ك"
          className="h-9 rounded-lg px-3 text-sm border bg-background text-foreground border-border"        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted-foreground">Rate</label>
        <input
          name="rate"
          type="number"
          step="0.0001"
          min="0"
          placeholder="e.g. 1.0000"
          className="h-9 rounded-lg px-3 text-sm border bg-background text-foreground border-border"        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="h-9 rounded-lg px-4 text-sm font-semibold bg-primary text-primary-foreground"
      >
        {pending ? "Adding..." : "Add currency"}
      </button>
      {state?.error ? (
        <p className="text-xs w-full text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
