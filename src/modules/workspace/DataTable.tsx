"use client";

import { type ReactNode } from "react";
import type { Route } from "next";
import Link from "next/link";
import { ArrowRight, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import {
  EMPTY_NO_RECORDS,
  EMPTY_HINT_DEFAULT,
} from "./emptyStates";
import { EmptyState } from "./EmptyState";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Skeleton } from "@/components/ui/skeleton";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RoleContext = "admin" | "staff" | "candidate" | "company" | "inspector";

export type DataTableColumn<T> = {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  /** If set, this column is only rendered when the roleContext matches. */
  visibleRoles?: RoleContext[];
};

export type EmptyAction = {
  label: string;
  onClick: () => void;
};

export type DataTableProps<T extends { id: string | number }> = {
  title: string;
  description: string;
  rows: T[];
  columns: DataTableColumn<T>[];
  rowHref?: (row: T) => Route;
  /** Optional label function for the action link aria-label. */
  getRowLabel?: (row: T) => string;
  /** Loading state — shows skeleton rows when true. */
  loading?: boolean;
  /** Number of skeleton rows to show during loading (default: 5). */
  loadingSkeletonRows?: number;
  /** Custom empty state message. */
  emptyMessage?: string;
  /** Custom hint text below the empty message. */
  emptyHint?: string;
  /** Optional CTA button in the empty state. */
  emptyAction?: EmptyAction;
  /** Error message — shows error state when set (overrides empty). */
  error?: string;
  /** Callback for the retry button in the error state. */
  onRetry?: () => void;
  /** Total number of pages (for pagination). */
  totalPages?: number;
  /** Current page (1-indexed). */
  page?: number;
  /** Callback when page changes. */
  onPageChange?: (page: number) => void;
  /** Number of items per page (for display in row count). */
  pageSize?: number;
  /** Role context for column visibility filtering. */
  roleContext?: RoleContext;
};

// ---------------------------------------------------------------------------
// OS Pagination
// ---------------------------------------------------------------------------

function OsPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <nav className="shOsTablePagination" aria-label="Pagination">
      <span className="shOsTablePageInfo">
        Page {page} of {totalPages}
      </span>
      <div className="shOsTablePageButtons">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
          className="shOsTablePageBtn"
        >
          <ChevronLeft size={14} />
          <span>Previous</span>
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
          className="shOsTablePageBtn"
        >
          <span>Next</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getVisibleColumns<T>(
  columns: DataTableColumn<T>[],
  roleContext?: RoleContext,
): DataTableColumn<T>[] {
  if (!roleContext) return columns;
  return columns.filter(
    (col) => !col.visibleRoles || col.visibleRoles.includes(roleContext),
  );
}

// ---------------------------------------------------------------------------
// DataTable component
// ---------------------------------------------------------------------------

export function DataTable<T extends { id: string | number }>({
  title,
  description,
  rows,
  columns,
  rowHref,
  getRowLabel,
  loading = false,
  loadingSkeletonRows = 5,
  emptyMessage,
  emptyHint,
  emptyAction,
  error,
  onRetry,
  totalPages,
  page = 1,
  onPageChange,
  pageSize,
  roleContext,
}: DataTableProps<T>) {
  const visibleColumns = getVisibleColumns(columns, roleContext);
  const colCount = visibleColumns.length + (rowHref ? 1 : 0);

  // ── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <GlassPanel variant="subtle" radius="lg" className="p-0 overflow-hidden">
        <div className="shOsTableHeader">
          <div>
            <h2 className="shOsTableTitle">{title}</h2>
            <p className="shOsTableDesc">{description}</p>
          </div>
        </div>
        <div className="shOsTableScroller">
          <table className="shOsTable" aria-label={title}>
            <thead>
              <tr>
                {visibleColumns.map((column) => (
                  <th key={column.key} scope="col" className="shOsTableTh">{column.label}</th>
                ))}
                {rowHref ? <th scope="col" aria-label="Open record" className="shOsTableTh" /> : null}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: loadingSkeletonRows }).map((_, rowIdx) => (
                <tr key={rowIdx} className="shOsTableRow shOsTableRowSkeleton">
                  {visibleColumns.map((column) => (
                    <td key={column.key} className="shOsTableTd">
                      <Skeleton variant="glass" rounded="md" className="h-4 w-[60%]" />
                    </td>
                  ))}
                  {rowHref ? (
                    <td className="shOsTableTd shOsTableTdAction">
                      <Skeleton variant="glass" rounded="md" className="h-4 w-8" />
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    );
  }

  // ── Error state ────────────────────────────────────────────
  if (error) {
    return (
      <GlassPanel variant="subtle" radius="lg" className="p-0 overflow-hidden">
        <div className="shOsTableHeader">
          <div>
            <h2 className="shOsTableTitle">{title}</h2>
            <p className="shOsTableDesc">{description}</p>
          </div>
        </div>
        <div className="shOsTableScroller">
          <table className="shOsTable" aria-label={title}>
            <thead>
              <tr>
                {visibleColumns.map((column) => (
                  <th key={column.key} scope="col" className="shOsTableTh">{column.label}</th>
                ))}
                {rowHref ? <th scope="col" aria-label="Open record" className="shOsTableTh" /> : null}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={colCount} className="shOsTableTdEmpty">
                  <div className="shOsTableErrorState">
                    <AlertCircle size={24} className="shOsTableErrorIcon" />
                    <strong className="shOsTableErrorText">{error}</strong>
                    {onRetry ? (
                      <button type="button" onClick={onRetry} className="shOsTableErrorBtn">
                        Retry
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </GlassPanel>
    );
  }

  // ── Row count display ──────────────────────────────────────
  const rowCountLabel = pageSize
    ? `${rows.length} shown — ${pageSize} per page`
    : `${rows.length} shown`;

  // ── Has pagination? ────────────────────────────────────────
  const hasPagination =
    totalPages !== undefined &&
    totalPages > 1 &&
    page !== undefined &&
    onPageChange !== undefined;

  return (
    <GlassPanel variant="subtle" radius="lg" className="p-0 overflow-hidden shOsTableSurface">
      <div className="shOsTableHeader">
        <div>
          <h2 className="shOsTableTitle">{title}</h2>
          <p className="shOsTableDesc">{description}</p>
        </div>
        <span className="shOsTableCount">{rowCountLabel}</span>
      </div>
      <div className="shOsTableScroller">
        <table className="shOsTable" aria-label={title}>
          <thead>
            <tr>
              {visibleColumns.map((column) => (
                <th key={column.key} scope="col" className="shOsTableTh">{column.label}</th>
              ))}
              {rowHref ? <th scope="col" aria-label="Open record" className="shOsTableTh shOsTableThAction" /> : null}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row, idx) => (
                <tr
                  key={row.id}
                  className="shOsTableRow"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  {visibleColumns.map((column) => (
                    <td data-label={column.label} key={column.key} className="shOsTableTd">
                      {column.render(row)}
                    </td>
                  ))}
                  {rowHref ? (
                    <td className="shOsTableTd shOsTableTdAction">
                      <Link
                        href={rowHref(row)}
                        aria-label={getRowLabel ? `Open ${getRowLabel(row)}` : "Open record"}
                        className="shOsTableRowLink"
                      >
                        <span className="shOsTableRowLinkLabel">Open</span>
                        <ArrowRight size={14} className="shOsTableRowLinkIcon" />
                      </Link>
                    </td>
                  ) : null}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={colCount} className="shOsTableTdEmpty">
                  <EmptyState
                    variant="no-records"
                    message={emptyMessage ?? EMPTY_NO_RECORDS}
                    hint={emptyHint ?? EMPTY_HINT_DEFAULT}
                    action={emptyAction ?? undefined}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {hasPagination ? (
        <OsPagination
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      ) : null}
    </GlassPanel>
  );
}
