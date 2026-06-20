"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ---------------------------------------------------------------------------
// PaymentFilters
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

const STATUS_OPTIONS = ["AUTHORISED", "PAID", "VOIDED", "DELETED"];
const TYPE_OPTIONS = ["RECEIVE", "SPEND", "TRANSFER"];

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
      <div className="rounded-lg border border-border bg-white p-4 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Status
            </label>
            <Select
              value={filters.status}
              onValueChange={(v) => handleChange("status", v)}
            >
              <SelectTrigger className="h-10 w-36" aria-label="Filter by status">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Type
            </label>
            <Select
              value={filters.type}
              onValueChange={(v) => handleChange("type", v)}
            >
              <SelectTrigger className="h-10 w-36" aria-label="Filter by type">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {TYPE_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date from */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="payment-date-from" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              From
            </label>
            <input
              id="payment-date-from"
              type="date"
              className="flex h-10 w-40 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={filters.dateFrom}
              onChange={(e) => handleChange("dateFrom", e.target.value)}
            />
          </div>

          {/* Date to */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="payment-date-to" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              To
            </label>
            <input
              id="payment-date-to"
              type="date"
              className="flex h-10 w-40 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={filters.dateTo}
              onChange={(e) => handleChange("dateTo", e.target.value)}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button onClick={onApply} size="default">
              Apply
            </Button>
            <Button onClick={onClear} variant="outline">
              Clear
            </Button>
          </div>
        </div>
      </div>

      {emptyResult && (
        <div className="flex flex-col items-center justify-center py-16 gap-4" role="status">
          <span className="text-4xl" aria-hidden="true">🔍</span>
          <p className="text-lg font-semibold text-foreground">No payments match your filters</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria</p>
          <Button onClick={onClear} variant="default">
            Clear Filters
          </Button>
        </div>
      )}
    </>
  );
}
