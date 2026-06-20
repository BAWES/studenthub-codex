"use client";

import { useState, useMemo, useCallback, type KeyboardEvent } from "react";
import type { PaymentRow } from "../schemas";

// ---------------------------------------------------------------------------
// PaymentDataTable
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

type SortKey = "date" | "reference" | "total" | "status";
type SortDir = "asc" | "desc";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  AUTHORISED: { bg: "rgba(34, 197, 94, 0.15)", text: "#22c55e" },
  PAID: { bg: "rgba(34, 197, 94, 0.15)", text: "#22c55e" },
  VOIDED: { bg: "rgba(239, 68, 68, 0.15)", text: "#ef4444" },
  DELETED: { bg: "rgba(239, 68, 68, 0.15)", text: "#ef4444" },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatAmount(total: number | null, currency: string | null): string {
  if (total === null) return "—";
  return `${total.toLocaleString("en-US", { maximumFractionDigits: 3 })} ${currency ?? "KWD"}`;
}

function StatusBadge({ status }: { status: string | null }) {
  const color = STATUS_COLORS[status ?? ""] ?? { bg: "rgba(255,255,255,0.06)", text: "rgba(255,255,255,0.4)" };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ background: color.bg, color: color.text }}
      aria-label={`Status: ${status ?? "Unknown"}`}
    >
      {status ?? "Unknown"}
    </span>
  );
}

function ReconciledCheck({ reconciled }: { reconciled: boolean | null }) {
  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-sm"
      style={{
        background: reconciled ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.1)",
        color: reconciled ? "#22c55e" : "#ef4444",
      }}
      aria-label={reconciled ? "Reconciled" : "Not reconciled"}
    >
      {reconciled ? "✓" : "✗"}
    </span>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-4 rounded bg-white/5 animate-pulse" style={{ width: `${60 + i * 15}px`, flex: i === 2 ? "1" : undefined }} />
      ))}
    </div>
  );
}

const COLUMNS = [
  { key: "date" as const, label: "Date", width: "120px", align: "left" as const, sortable: true },
  { key: "reference" as const, label: "Reference", width: "160px", align: "left" as const, sortable: true },
  { key: "contact_name" as const, label: "Contact", width: "1fr", align: "left" as const, sortable: false },
  { key: "type" as const, label: "Type", width: "100px", align: "center" as const, sortable: false },
  { key: "total" as const, label: "Amount", width: "140px", align: "right" as const, sortable: true },
  { key: "currency_code" as const, label: "Currency", width: "70px", align: "center" as const, sortable: false },
  { key: "status" as const, label: "Status", width: "120px", align: "center" as const, sortable: true },
  { key: "is_reconciled" as const, label: "Reconciled", width: "90px", align: "center" as const, sortable: false },
];

const SORT_KEYS = new Set<string>(["date", "reference", "total", "status"]);

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
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = useCallback((key: string) => {
    if (!SORT_KEYS.has(key)) return;
    const sk = key as SortKey;
    setSortKey((prev) => {
      if (prev === sk) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      else setSortDir("desc");
      return sk;
    });
  }, []);

  const sortedPayments = useMemo(() => {
    return [...payments].sort((a, b) => {
      const aVal = a[sortKey as keyof PaymentRow];
      const bVal = b[sortKey as keyof PaymentRow];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = typeof aVal === "number" ? aVal - (bVal as number) : String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [payments, sortKey, sortDir]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent, payment: PaymentRow) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onRowClick(payment);
      }
    },
    [onRowClick],
  );

  if (error && !loading) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-white p-8" role="alert">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="text-3xl" aria-hidden="true">⚠️</span>
          <div>
            <p className="text-lg font-semibold text-foreground">Could not load payments</p>
            <p className="text-sm mt-1 text-muted-foreground">{error}</p>
          </div>
          <button onClick={onRetry} className="h-10 rounded-lg px-4 text-sm font-semibold" style={{ background: "var(--sh-info)", color: "#fff" }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--border)] bg-white overflow-hidden">
      <div
        className="grid gap-0 text-[11px] font-bold uppercase tracking-wider px-4 py-3"
        style={{
          gridTemplateColumns: COLUMNS.map((c) => c.width).join(" "),
          color: "var(--muted)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            className={`flex items-center gap-1 ${col.align === "right" ? "justify-end" : col.align === "center" ? "justify-center" : ""}`}
            style={{ cursor: col.sortable ? "pointer" : "default" }}
            onClick={() => col.sortable && handleSort(col.key)}
          >
            {col.label}
            {sortKey === col.key && <span style={{ color: "var(--sh-info)" }}>{sortDir === "asc" ? "▲" : "▼"}</span>}
          </div>
        ))}
      </div>

      {loading ? (
        <div>
          {Array.from({ length: 10 }).map((_, i) => (<SkeletonRow key={i} />))}
        </div>
      ) : !sortedPayments.length ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4" role="status">
          <span className="text-4xl" aria-hidden="true">💳</span>
          <p className="text-lg font-semibold text-foreground">No payments yet</p>
          <p className="text-sm text-center max-w-md text-muted-foreground">
            Payments will appear here once bank transactions are synced from Xero.
          </p>
        </div>
      ) : (
        <div>
          {sortedPayments.map((payment, i) => (
            <div
              key={payment.bank_transaction_id}
              className="grid gap-0 px-4 py-3 transition-all duration-150 cursor-pointer"
              style={{
                gridTemplateColumns: COLUMNS.map((c) => c.width).join(" "),
                background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
              }}
              role="button"
              tabIndex={0}
              aria-label={`Payment ${payment.reference ?? payment.bank_transaction_id}`}
              onClick={() => onRowClick(payment)}
              onKeyDown={(e) => handleKeyDown(e, payment)}
            >
              <span className="text-sm text-foreground">{formatDate(payment.date)}</span>
              <span className="text-sm font-medium text-foreground">{payment.reference ?? "—"}</span>
              <span className="text-sm truncate text-foreground">{payment.contact_name ?? "—"}</span>
              <span className="text-sm text-center text-muted-foreground">{payment.type ?? "—"}</span>
              <span className="text-sm text-right font-medium text-foreground">{formatAmount(payment.total, payment.currency_code)}</span>
              <span className="text-sm text-center text-muted-foreground">{payment.currency_code ?? "—"}</span>
              <span className="flex justify-center"><StatusBadge status={payment.status} /></span>
              <span className="flex justify-center"><ReconciledCheck reconciled={payment.is_reconciled} /></span>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && total > 0 && onPageChange && (
        <div className="flex items-center justify-between px-4 py-3 text-sm" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", color: "var(--muted)" }}>
          <span>Showing {1 + (page - 1) * 20}-{Math.min(page * 20, total)} of {total}</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="px-3 py-1.5 rounded-md text-sm font-medium disabled:opacity-30"
              style={{ background: "rgba(255,255,255,0.06)" }}
              aria-label="Previous page"
            >
              ← Prev
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="px-3 py-1.5 rounded-md text-sm font-medium disabled:opacity-30"
              style={{ background: "rgba(255,255,255,0.06)" }}
              aria-label="Next page"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}