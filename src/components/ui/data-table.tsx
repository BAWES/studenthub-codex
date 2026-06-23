"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";

/* ==========================================================================
   StudentHub OS — DataTable
   Unified list component with loading skeletons, empty states with
   illustrations, error states, and pagination.
   Wraps the shOsTable primitives with data-aware states.
   ========================================================================== */

// ── Column definition ──────────────────────────────────────────

export type DataTableColumn<T> = {
  /** Column header label */
  header: string;
  /** Cell content renderer */
  cell: (row: T, index: number) => React.ReactNode;
  /** Optional CSS class name for this column's cells */
  className?: string;
  /** Hide on mobile? */
  hideOnMobile?: boolean;
};

// ── Props ──────────────────────────────────────────────────────

export interface DataTableProps<T> {
  /** Column definitions */
  columns: DataTableColumn<T>[];
  /** Row data */
  rows: T[];
  /** Unique key accessor */
  rowKey: (row: T) => string | number;
  /** Optional row click handler */
  onRowClick?: (row: T) => void;
  /** Loading state — shows skeleton */
  loading?: boolean;
  /** Loading skeleton row count (default: 5) */
  skeletonRows?: number;
  /** Error state */
  error?: string | null;
  /** Empty state content */
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  emptyActionHref?: string;
  onEmptyAction?: () => void;
  /** Extra className */
  className?: string;
  /** Table-level aria-label */
  ariaLabel?: string;
}

// ── Table Skeleton ─────────────────────────────────────────────

function DataTableSkeleton({
  columns,
  rows,
}: {
  columns: DataTableColumn<unknown>[];
  rows: number;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col, i) => (
            <TableHead key={i} className={col.className}>
              {col.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <TableRow key={rowIdx}>
            {columns.map((col, colIdx) => (
              <TableCell key={colIdx} className={col.className}>
                <div
                  className="h-4 rounded animate-pulse bg-border"
                  style={{
                    width: `${50 + Math.random() * 40}%`,
                  }}
                />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ── Main Component ─────────────────────────────────────────────

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  loading = false,
  skeletonRows = 5,
  error = null,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  emptyActionHref,
  onEmptyAction,
  className,
  ariaLabel,
}: DataTableProps<T>) {
  // ── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <div className={cn("shOsDataTable", className)}>
        <DataTableSkeleton columns={columns as DataTableColumn<unknown>[]} rows={skeletonRows} />
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────
  if (error) {
    return (
      <div className={cn("shOsDataTable", className)}>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, i) => (
                <TableHead key={i} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        </Table>
        <div className="py-12">
          <EmptyState
            variant="error"
            title={error}
            description="Something went wrong loading this data. Try again or contact support."
          />
        </div>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────
  if (rows.length === 0) {
    return (
      <div className={cn("shOsDataTable", className)}>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, i) => (
                <TableHead key={i} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        </Table>
        <div className="py-12">
          <EmptyState
            variant="idle"
            title={emptyTitle ?? "No records yet"}
            description={emptyDescription ?? "This table will populate as data is imported or created."}
            actionLabel={emptyActionLabel}
            actionHref={emptyActionHref}
            onAction={onEmptyAction}
          />
        </div>
      </div>
    );
  }

  // ── Data state ─────────────────────────────────────────────
  return (
    <div className={cn("shOsDataTable", className)} aria-label={ariaLabel}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col, i) => (
              <TableHead key={i} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((col, colIdx) => (
                <TableCell key={colIdx} className={col.className}>
                  {col.cell(row, idx)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
