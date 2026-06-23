"use client";

import { useCallback } from "react";

// ---------------------------------------------------------------------------
// InvoiceFilters
// ---------------------------------------------------------------------------
// Glass-styled filter bar for invoice status and date range.
// ---------------------------------------------------------------------------

export type InvoiceFilterValues = {
  status: string;
  dateFrom: string;
  dateTo: string;
};

export type InvoiceFiltersProps = {
  filters: InvoiceFilterValues;
  onFilterChange: (filters: InvoiceFilterValues) => void;
  onApply: () => void;
  onClear: () => void;
  emptyResult?: boolean;
};

const STATUS_OPTIONS = ["", "paid", "unpaid"];

export function InvoiceFilters({
  filters,
  onFilterChange,
  onApply,
  onClear,
  emptyResult = false,
}: InvoiceFiltersProps) {
  const handleChange = useCallback(
    (key: keyof InvoiceFilterValues, value: string) => {
      onFilterChange({ ...filters, [key]: value });
    },
    [filters, onFilterChange],
  );

  return (
    <>
      <div className="rounded-lg border border-border bg-white p-4 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="invoice-status"
              className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
            >
              Status
            </label>
            <select
              id="invoice-status"
              className="h-10 rounded-lg px-3 text-sm bg-transparent border border-border text-foreground"
              value={filters.status}
              onChange={(e) => handleChange("status", e.target.value)}
            >
              <option value="">All Status</option>
              {STATUS_OPTIONS.filter(Boolean).map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="invoice-date-from"
              className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
            >
              From
            </label>
            <input
              id="invoice-date-from"
              type="date"
              className="h-10 rounded-lg px-3 text-sm bg-transparent border border-border text-foreground"
              value={filters.dateFrom}
              onChange={(e) => handleChange("dateFrom", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="invoice-date-to"
              className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
            >
              To
            </label>
            <input
              id="invoice-date-to"
              type="date"
              className="h-10 rounded-lg px-3 text-sm bg-transparent border border-border text-foreground"
              value={filters.dateTo}
              onChange={(e) => handleChange("dateTo", e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onApply}
              className="h-10 rounded-lg px-4 text-sm font-semibold transition-all duration-150 bg-primary text-primary-foreground"
            >
              Apply
            </button>
            <button
              onClick={onClear}
              className="h-10 rounded-lg px-4 text-sm font-semibold border border-border text-muted-foreground bg-transparent"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {emptyResult && (
        <div className="flex flex-col items-center justify-center py-16 gap-4" role="status">
          <span className="text-4xl" aria-hidden="true">📄</span>
          <p className="text-lg font-semibold text-foreground">No invoices match your filters</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria</p>
          <button onClick={onClear} className="h-10 rounded-lg px-4 text-sm font-semibold bg-primary text-primary-foreground">
            Clear Filters
          </button>
        </div>
      )}
    </>
  );
}
