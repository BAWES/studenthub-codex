"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
      <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-end gap-4">
          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider">
              Status
            </Label>
            <Select
              value={filters.status}
              onValueChange={(v) => handleChange("status", v === "all" ? "" : v)}
            >
              <SelectTrigger className="h-10 w-36" aria-label="Filter by status">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider">
              Type
            </Label>
            <Select
              value={filters.type}
              onValueChange={(v) => handleChange("type", v === "all" ? "" : v)}
            >
              <SelectTrigger className="h-10 w-36" aria-label="Filter by type">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {TYPE_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date from */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="payment-date-from" className="text-xs font-bold uppercase tracking-wider">
              From
            </Label>
            <Input
              id="payment-date-from"
              type="date"
              className="h-10 w-40"
              value={filters.dateFrom}
              onChange={(e) => handleChange("dateFrom", e.target.value)}
            />
          </div>

          {/* Date to */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="payment-date-to" className="text-xs font-bold uppercase tracking-wider">
              To
            </Label>
            <Input
              id="payment-date-to"
              type="date"
              className="h-10 w-40"
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
      </CardContent>
    </Card>

    {emptyResult && (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 gap-4" role="status">
          <p className="text-lg font-semibold text-foreground">No payments match your filters</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria</p>
          <Button onClick={onClear} variant="default">
            Clear Filters
          </Button>
        </CardContent>
      </Card>
    )}
    </>
  );
}
