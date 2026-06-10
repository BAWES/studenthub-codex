"use client";

import { useCallback } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";

// ---------------------------------------------------------------------------
// PaymentFilters
// ---------------------------------------------------------------------------
// Glass-styled filter bar for status, type, and date range.
// ---------------------------------------------------------------------------

export type PaymentFilterValues = {
  status: string;
  type: string;
  dateFrom: string;
  dateTo: string;
};

export type PaymentFiltersProps = {
  filters: PaymentFilterValues;
  onFilterChange: (filters: PaymentFilterValues) => void;
  onApply: () => void;
  onClear: () => void;
  emptyResult?: boolean;
};

const STATUS_OPTIONS = ["", "AUTHORISED", "PAID", "VOIDED", "DELETED"];
const TYPE_OPTIONS = ["", "RECEIVE", "SPEND", "TRANSFER"];

export function PaymentFilters({
  filters,
  onFilterChange,
  onApply,
  onClear,
  emptyResult = false,
}: PaymentFiltersProps) {
  const handleChange = useCallback(
    (key: keyof PaymentFilterValues, value: string) => {
      onFilterChange({ ...filters, [key]: value });
    },
    [filters, onFilterChange],
  );

  return (
    <>
      <GlassPanel variant="subtle" radius="md" className="p-4 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="payment-status" className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              Status
            </label>
            <select
              id="payment-status"
              className="h-10 rounded-lg px-3 text-sm bg-transparent border"
              style={{ borderColor: "var(--border)", color: "var(--ink)" }}
              value={filters.status}
              onChange={(e) => handleChange("status", e.target.value)}
            >
              <option value="">All Status</option>
              {STATUS_OPTIONS.filter(Boolean).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="payment-type" className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              Type
            </label>
            <select
              id="payment-type"
              className="h-10 rounded-lg px-3 text-sm bg-transparent border"
              style={{ borderColor: "var(--border)", color: "var(--ink)" }}
              value={filters.type}
              onChange={(e) => handleChange("type", e.target.value)}
            >
              <option value="">All Types</option>
              {TYPE_OPTIONS.filter(Boolean).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="payment-date-from" className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              From
            </label>
            <input
              id="payment-date-from"
              type="date"
              className="h-10 rounded-lg px-3 text-sm bg-transparent border"
              style={{ borderColor: "var(--border)", color: "var(--ink)" }}
              value={filters.dateFrom}
              onChange={(e) => handleChange("dateFrom", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="payment-date-to" className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              To
            </label>
            <input
              id="payment-date-to"
              type="date"
              className="h-10 rounded-lg px-3 text-sm bg-transparent border"
              style={{ borderColor: "var(--border)", color: "var(--ink)" }}
              value={filters.dateTo}
              onChange={(e) => handleChange("dateTo", e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onApply}
              className="h-10 rounded-lg px-4 text-sm font-semibold transition-all duration-150"
              style={{ background: "var(--sh-info)", color: "#fff" }}
            >
              Apply
            </button>
            <button
              onClick={onClear}
              className="h-10 rounded-lg px-4 text-sm font-semibold"
              style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--muted)" }}
            >
              Clear
            </button>
          </div>
        </div>
      </GlassPanel>

      {emptyResult && (
        <div className="flex flex-col items-center justify-center py-16 gap-4" role="status">
          <span className="text-4xl" aria-hidden="true">🔍</span>
          <p className="text-lg font-semibold" style={{ color: "var(--ink)" }}>No payments match your filters</p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>Try adjusting your search or filter criteria</p>
          <button onClick={onClear} className="h-10 rounded-lg px-4 text-sm font-semibold" style={{ background: "var(--sh-info)", color: "#fff" }}>
            Clear Filters
          </button>
        </div>
      )}
    </>
  );
}
