"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { InvoiceRow } from "../schemas";
import { updateInvoice, deleteInvoice } from "../actions";

type Props = {
  session: SessionUser;
  invoices: InvoiceRow[];
};

export function AdminInvoicesTable({ session, invoices }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const toggleStatus = useCallback(
    async (row: InvoiceRow) => {
      setError(null);
      const newStatus = row.invoice_status === "paid" ? "unpaid" : "paid";
      try {
        await updateInvoice({ invoiceId: row.invoice_id, invoice_status: newStatus } as any);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update invoice status");
      }
    },
    [router],
  );

  const handleDelete = useCallback(
    async (row: InvoiceRow) => {
      setError(null);
      if (!confirm(`Delete invoice #${row.invoice_id}?`)) return;
      try {
        await deleteInvoice({ invoiceId: row.invoice_id });
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete invoice");
      }
    },
    [router],
  );

  const totalAmount = invoices.reduce((sum, inv) => {
    const amt = parseFloat(inv.total ?? "0");
    return sum + (isNaN(amt) ? 0 : amt);
  }, 0);
  const paidCount = invoices.filter((inv) => inv.invoice_status === "paid").length;

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Manage invoices — payment records linked to company transfers."
      metrics={[
        { label: "Total invoices", value: invoices.length, note: "Payment records in the system" },
        { label: "Paid", value: paidCount, note: `${invoices.length - paidCount} unpaid` },
        { label: "Total amount", value: totalAmount.toFixed(3), note: "KWD" },
      ]}
    >
      {error ? (
        <div
          className="mb-4 rounded-lg border px-4 py-3 text-sm border-destructive text-destructive bg-card"
        >
          {error}
        </div>
      ) : null}

      <DataTable
        title="Invoices"
        description="All payment invoices. Click status to toggle between paid/unpaid."
        rows={invoices.map((inv) => ({ ...inv, id: inv.invoice_id }))}
        rowHref={undefined}
        columns={[
          {
            key: "invoice_id",
            label: "ID",
            render: (row) => (
              <span className="text-sm font-mono text-muted-foreground">
                #{row.invoice_id}
              </span>
            ),
          },
          {
            key: "company_name",
            label: "Company",
            render: (row) => (
              <span className="text-sm text-foreground">
                {row.company_name ?? "—"}
              </span>
            ),
          },
          {
            key: "invoice_date",
            label: "Date",
            render: (row) => {
              const d = row.invoice_date ? new Date(row.invoice_date) : null;
              return (
                <span className="text-sm text-foreground">
                  {d ? d.toLocaleDateString() : "—"}
                </span>
              );
            },
          },
          {
            key: "invoice_status",
            label: "Status",
            render: (row) => (
              <button
                type="button"
                onClick={() => toggleStatus(row)}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 hover:opacity-80"
                style={{
                  background:
                    row.invoice_status === "paid"
                      ? "rgba(34, 197, 94, 0.12)"
                      : "rgba(234, 179, 8, 0.12)",
                  color:
                    row.invoice_status === "paid"
                      ? "rgb(22, 163, 74)"
                      : "rgb(161, 98, 7)",
                }}
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{
                    background:
                      row.invoice_status === "paid"
                        ? "rgb(22, 163, 74)"
                        : "rgb(161, 98, 7)",
                  }}
                />
                {row.invoice_status === "paid" ? "Paid" : "Unpaid"}
              </button>
            ),
          },
          {
            key: "total",
            label: "Total",
            render: (row) => (
              <span className="text-sm font-medium text-foreground">
                {row.total ? `${parseFloat(row.total).toFixed(3)}` : "—"}{" "}
                {row.currency_code ?? ""}
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
                onClick={() => handleDelete(row)}
              >
                Delete
              </button>
            ),
          },
        ]}
      />
    </WorkspaceShell>
  );
}
