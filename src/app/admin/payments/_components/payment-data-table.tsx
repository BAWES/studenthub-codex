"use client";

import { useMemo, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { DataTablePage, type DataTableColumn } from "@/modules/workspace/DataTablePage";
import type { PaymentRow } from "../schemas";

// ---------------------------------------------------------------------------
// PaymentDataTable — thin wrapper around the shared DataTablePage
// ---------------------------------------------------------------------------

export type PaymentDataTableProps = {
  payments: PaymentRow[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  onRowClick: (payment: PaymentRow) => void;
  onRetry: () => void;
  onPageChange?: (page: number) => void;
};

// ── Helpers ─────────────────────────────────────────────────────

const STATUS_BADGE_VARIANTS: Record<string, "success" | "warning" | "secondary" | "default"> = {
  AUTHORISED: "success",
  PAID: "success",
  VOIDED: "warning",
  DELETED: "warning",
};

function StatusBadge({ status }: { status: string | null }) {
  const variant = STATUS_BADGE_VARIANTS[status ?? ""] ?? "secondary";
  return (
    <Badge variant={variant} aria-label={`Status: ${status ?? "Unknown"}`}>
      {status ?? "Unknown"}
    </Badge>
  );
}

function ReconciledCheck({ reconciled }: { reconciled: boolean | null }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm ${
        reconciled
          ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
          : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
      }`}
      aria-label={reconciled ? "Reconciled" : "Not reconciled"}
    >
      {reconciled ? "✓" : "✗"}
    </span>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatAmount(total: number | null, currency: string | null): string {
  if (total === null) return "—";
  return `${total.toLocaleString("en-US", { maximumFractionDigits: 3 })} ${currency ?? "KWD"}`;
}

// ── Row type with id ─────────────────────────────────────────────

type PaymentRowWithId = PaymentRow & { id: string };

// ── Columns ──────────────────────────────────────────────────────

function buildColumns(): DataTableColumn<PaymentRowWithId>[] {
  return [
    { key: "date", label: "Date", render: (row) => formatDate(row.date) },
    { key: "reference", label: "Reference", render: (row) => <span className="font-medium">{row.reference ?? "—"}</span> },
    { key: "contact_name", label: "Contact", render: (row) => <span className="truncate">{row.contact_name ?? "—"}</span> },
    { key: "type", label: "Type", render: (row) => row.type ?? "—" },
    { key: "total", label: "Amount", render: (row) => <span className="font-medium">{formatAmount(row.total, row.currency_code)}</span> },
    { key: "currency_code", label: "Currency", render: (row) => row.currency_code ?? "—" },
    { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "is_reconciled", label: "Reconciled", render: (row) => <ReconciledCheck reconciled={row.is_reconciled} /> },
  ];
}

// ── Component ────────────────────────────────────────────────────

export function PaymentDataTable({
  payments,
  total,
  page,
  totalPages,
  loading,
  error,
  onRowClick,
  onRetry,
  onPageChange,
}: PaymentDataTableProps) {
  const rows = useMemo<PaymentRowWithId[]>(
    () => payments.map((p) => ({ ...p, id: p.bank_transaction_id })),
    [payments],
  );

  const columns = useMemo(() => buildColumns(), []);

  return (
    <DataTablePage
      title="Payments"
      description={`${total} total transactions`}
      columns={columns}
      rows={rows}
      loading={loading}
      error={error}
      onRowClick={(row) => onRowClick(row)}
      page={page}
      totalPages={totalPages}
      onPageChange={onPageChange}
      onRetry={onRetry}
    />
  );
}
