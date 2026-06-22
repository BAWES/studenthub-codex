"use client";

import { useState, useMemo, useCallback, type KeyboardEvent } from "react";
import type { InvoiceRow } from "../schemas";

// ---------------------------------------------------------------------------
// InvoiceDataTable
// ---------------------------------------------------------------------------

export type InvoiceDataTableProps = {
  invoices: InvoiceRow[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  onRowClick: (invoice: InvoiceRow) => void;
  onRetry: () => void;
  onPageChange?: (page: number) => void;
};

type SortKey = "company_name" | "invoice_date" | "invoice_status" | "total";
type SortDir = "asc" | "desc";

type ColDef = {
  key: SortKey | "currency_code";
  label: string;
  width: string;
  align: "left" | "center" | "right";
  sortable: boolean;
};

const COLUMNS: ColDef[] = [
  { key: "company_name", label: "Company", width: "1fr", align: "left", sortable: true },
  { key: "invoice_date", label: "Date", width: "140px", align: "left", sortable: true },
  { key: "total", label: "Amount", width: "140px", align: "right", sortable: true },
  { key: "currency_code", label: "Currency", width: "80px", align: "center", sortable: false },
  { key: "invoice_status", label: "Status", width: "120px", align: "center", sortable: true },
];

const SORT_KEYS = new Set<string>(["company_name", "invoice_date", "invoice_status", "total"]);

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatAmount(total: string | null, currency: string | null): string {
  if (total === null) return "—";
  const num = Number.parseFloat(total);
  if (Number.isNaN(num)) return total;
  return `${num.toLocaleString("en-US", { maximumFractionDigits: 3 })} ${currency ?? "KWD"}`;
}

function StatusBadge({ status }: { status: string | null }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
        status === "paid" ? "bg-green-500/15 text-green-600" : status === "unpaid" ? "bg-red-500/15 text-red-500" : "bg-white/5 text-white/40"
      }`}
      aria-label={`Status: ${status ?? "Unknown"}`}
    >
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown"}
    </span>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded bg-white/5 animate-pulse"
          style={{ width: `${80 + i * 25}px`, flex: i === 0 ? "1" : undefined }}
        />
      ))}
    </div>
  );
}

export function InvoiceDataTable({
  invoices,
  total,
  page,
  totalPages,
  loading,
  error,
  onRowClick,
  onRetry,
  onPageChange,
}: InvoiceDataTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("invoice_date");
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

  const sortedInvoices = useMemo(() => {
    return [...invoices].sort((a, b) => {
      const aVal = a[sortKey as keyof InvoiceRow];
      const bVal = b[sortKey as keyof InvoiceRow];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp =
        typeof aVal === "number"
          ? aVal - (bVal as number)
          : String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [invoices, sortKey, sortDir]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent, invoice: InvoiceRow) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onRowClick(invoice);
      }
    },
    [onRowClick],
  );

  if (error && !loading) {
    return (
      <div className="rounded-lg border border-border bg-white p-8" role="alert">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="text-3xl" aria-hidden="true">⚠️</span>
          <div>
            <p className="text-lg font-semibold text-foreground">Could not load invoices</p>
            <p className="text-sm mt-1 text-muted-foreground">{error}</p>
          </div>
          <button onClick={onRetry} className="h-10 rounded-lg px-4 text-sm font-semibold bg-primary text-primary-foreground">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-white overflow-hidden">
      <div
        className="grid gap-0 text-[11px] font-bold uppercase tracking-wider px-4 py-3 text-muted-foreground border-b border-white/10"
        style={{
          gridTemplateColumns: COLUMNS.map((c) => c.width).join(" "),
        }}
      >
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            className={`flex items-center gap-1 ${col.align === "right" ? "justify-end" : col.align === "center" ? "justify-center" : ""} ${col.sortable ? "cursor-pointer" : "cursor-default"}`}
            onClick={() => col.sortable && handleSort(col.key)}
          >
            {col.label}
            {sortKey === col.key && (
              <span className="text-blue-500">{sortDir === "asc" ? "▲" : "▼"}</span>
            )}
          </div>
        ))}
      </div>

      {loading ? (
        <div>
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : !sortedInvoices.length ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4" role="status">
          <span className="text-4xl" aria-hidden="true">📄</span>
          <p className="text-lg font-semibold text-foreground">No invoices yet</p>
          <p className="text-sm text-center max-w-md text-muted-foreground">
            Invoices will appear here once they are generated from transfer billing.
          </p>
        </div>
      ) : (
        <div>
          {sortedInvoices.map((invoice, i) => (
            <div
              key={invoice.invoice_id}
              className="grid gap-0 px-4 py-3 transition-all duration-150 cursor-pointer even:bg-transparent odd:bg-muted/30"
              style={{
                gridTemplateColumns: COLUMNS.map((c) => c.width).join(" "),
              }}
              role="button"
              tabIndex={0}
              aria-label={`Invoice ${invoice.invoice_id} — ${invoice.company_name ?? "Unknown company"}`}
              onClick={() => onRowClick(invoice)}
              onKeyDown={(e) => handleKeyDown(e, invoice)}
            >
              <span className="text-sm font-medium truncate text-foreground">
                {invoice.company_name ?? "—"}
              </span>
              <span className="text-sm text-foreground">
                {formatDate(invoice.invoice_date)}
              </span>
              <span className="text-sm text-right font-medium text-foreground">
                {formatAmount(invoice.total, invoice.currency_code)}
              </span>
              <span className="text-sm text-center text-muted-foreground">
                {invoice.currency_code ?? "—"}
              </span>
              <span className="flex justify-center">
                <StatusBadge status={invoice.invoice_status} />
              </span>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && total > 20 && onPageChange && (
        <div
          className="flex items-center justify-between px-4 py-3 text-sm border-t border-white/10 text-muted-foreground"
        >
          <span>Showing {1 + (page - 1) * 20}-{Math.min(page * 20, total)} of {total}</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="px-3 py-1.5 rounded-md text-sm font-medium disabled:opacity-30 bg-white/5"
              aria-label="Previous page"
            >
              ← Prev
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="px-3 py-1.5 rounded-md text-sm font-medium disabled:opacity-30 bg-white/5"
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
