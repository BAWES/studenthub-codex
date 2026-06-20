"use client";

import { useActionState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { Route } from "next";
import type { SessionUser } from "@/modules/auth/types";
import type { ExpenseItem } from "@/modules/admin/expense/schemas";
import { createExpense } from "../actions";

type Props = {
  session: SessionUser;
  expenses: ExpenseItem[];
  total: number;
};

export function AdminExpensesPage({ session, expenses, total }: Props) {
  const router = useRouter();

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Expenses — view and manage system expenses."
      metrics={[
        { label: "Total expenses", value: total, note: "Expenses in the system" },
      ]}
    >
      <section className="mb-6">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--ink)" }}>Add expense</h3>
          <CreateExpenseForm onSuccess={() => router.refresh()} />
        </div>
      </section>

      <DataTable
        title="Expenses"
        description="All expenses across the system. Click an expense to view details."
        rows={expenses.map((e) => ({ ...e, id: e.expense_uuid }))}
        rowHref={"/admin/expense" as Route}
        columns={[
          {
            key: "title",
            label: "Title",
            render: (row) => (
              <span className="text-sm font-medium">{row.title || "—"}</span>
            ),
          },
          {
            key: "type",
            label: "Type",
            render: (row) => (
              <span className="text-sm">{row.type || "—"}</span>
            ),
          },
          {
            key: "amount",
            label: "Amount",
            render: (row) => (
              <span className="text-sm">
                {row.amount != null ? parseFloat(row.amount).toFixed(3) : "—"}
              </span>
            ),
          },
          {
            key: "detail",
            label: "Detail",
            render: (row) => (
              <span className="text-sm truncate block max-w-[300px]">
                {row.detail || "—"}
              </span>
            ),
          },
          {
            key: "transaction_datetime",
            label: "Transaction Date",
            render: (row) => {
              if (!row.transaction_datetime) return "—";
              return new Date(row.transaction_datetime).toLocaleDateString();
            },
          },
        ]}
      />
    </WorkspaceShell>
  );
}

function CreateExpenseForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const title = formData.get("title") as string;
      const type = formData.get("type") as string;
      const detail = (formData.get("detail") as string) || undefined;
      const amount = (formData.get("amount") as string) || undefined;
      const transactionDatetime = (formData.get("transactionDatetime") as string) || undefined;

      const result = await createExpense({
        title,
        type,
        detail,
        amount: amount || undefined,
        transactionDatetime: transactionDatetime || undefined,
      });
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
        <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Title *</label>
        <input
          name="title"
          required
          maxLength={128}
          placeholder="Expense title..."
          className="h-9 rounded-lg px-3 text-sm border w-56"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Type *</label>
        <input
          name="type"
          required
          maxLength={128}
          placeholder="e.g. office, travel"
          className="h-9 rounded-lg px-3 text-sm border w-36"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Amount</label>
        <input
          name="amount"
          step="0.001"
          placeholder="0.000"
          className="h-9 rounded-lg px-3 text-sm border w-28"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Detail</label>
        <input
          name="detail"
          maxLength={500}
          placeholder="Optional detail..."
          className="h-9 rounded-lg px-3 text-sm border w-48"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
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
