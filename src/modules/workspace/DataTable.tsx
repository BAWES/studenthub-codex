"use client";

import type { ReactNode, KeyboardEvent } from "react";
import { useCallback } from "react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ChevronRight } from "lucide-react";
import {
  EMPTY_NO_RECORDS,
  EMPTY_HINT_DEFAULT,
} from "./emptyStates";
import { EmptyState } from "./EmptyState";

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
  /**
   * URL prefix for clickable rows. The row.id is appended to this prefix to
   * form the full path (e.g. "/company/companies/" + row.id).
   * Pass a static string — NOT a function — so it works across Server→Client
   * Component boundaries.
   */
  rowHref?: Route;
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
// Shimmer skeleton
// ---------------------------------------------------------------------------

function ShimmerSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      data-slot="skeleton"
      className={`shTableSkeleton ${className}`}
      aria-hidden="true"
    />
  );
}

// ---------------------------------------------------------------------------
// Glass pagination
// ---------------------------------------------------------------------------

function GlassPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <nav className="shTablePagination" aria-label="Pagination">
      <button
        type="button"
        className="shTablePageBtn"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronRight className="size-3.5 rotate-180" />
        Previous
      </button>
      <span className="shTablePageInfo">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        className="shTablePageBtn"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        Next
        <ChevronRight className="size-3.5" />
      </button>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Filter columns based on role context. If a column has `visibleRoles` set
 * and `roleContext` is provided, the column is only included when the current
 * role is in the visibleRoles list.
 */
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
  const router = useRouter();
  const handleRowKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTableRowElement>, href: Route) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        router.push(href);
      }
    },
    [router],
  );
  const colCount = visibleColumns.length + (rowHref ? 1 : 0);

  /** Build the full row URL by appending the row.id to the prefix. */
  const rowUrl = useCallback(
    (row: T): Route => {
      if (!rowHref) return "" as Route;
      const prefix = rowHref.endsWith("/") ? rowHref : `${rowHref}/`;
      return `${prefix}${row.id}` as Route;
    },
    [rowHref],
  );

  // ── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <section className="shTableGlass">
        <div className="shTableHeader">
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
        </div>
        <div className="shTableScroller">
          <table className="shTable" aria-label={title}>
            <thead>
              <tr>
                {visibleColumns.map((column) => (
                  <th key={column.key} scope="col">{column.label}</th>
                ))}
                {rowHref ? <th scope="col" aria-label="Open record" /> : null}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: loadingSkeletonRows }).map((_, rowIdx) => (
                <tr key={rowIdx}>
                  {visibleColumns.map((column) => (
                    <td key={column.key}>
                      <ShimmerSkeleton />
                    </td>
                  ))}
                  {rowHref ? (
                    <td>
                      <ShimmerSkeleton />
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  // ── Error state ────────────────────────────────────────────
  if (error) {
    return (
      <section className="shTableGlass">
        <div className="shTableHeader">
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
        </div>
        <div className="shTableScroller">
          <table className="shTable" aria-label={title}>
            <thead>
              <tr>
                {visibleColumns.map((column) => (
                  <th key={column.key} scope="col">{column.label}</th>
                ))}
                {rowHref ? <th scope="col" aria-label="Open record" /> : null}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={colCount} className="shTableEmptyCell">
                  <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center">
                    <div className="size-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                      <AlertCircle size={20} className="text-red-400" />
                    </div>
                    <strong className="text-sm text-foreground">
                      {error}
                    </strong>
                    {onRetry ? (
                      <button
                        type="button"
                        onClick={onRetry}
                        className="shTablePageBtn"
                      >
                        Retry
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
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
    <section className="shTableGlass">
      <div className="shTableHeader">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <span>{rowCountLabel}</span>
      </div>
      <div className="shTableScroller">
        <table className="shTable" aria-label={title}>
          <thead>
            <tr>
              {visibleColumns.map((column) => (
                <th key={column.key} scope="col">{column.label}</th>
              ))}
              {rowHref ? <th scope="col" aria-label="Open record" /> : null}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className={`shTableRow${rowHref ? " clickable" : ""}`}
                  {...(rowHref
                    ? {
                        tabIndex: 0,
                        role: "link",
                        onKeyDown: (e) => handleRowKeyDown(e, rowUrl(row)),
                      }
                    : {})}
                >
                  {visibleColumns.map((column) => (
                    <td data-label={column.label} key={column.key}>
                      {column.render(row)}
                    </td>
                  ))}
                  {rowHref ? (
                    <td data-label="Action" className="w-[1%] whitespace-nowrap">
                      <span className="shTableRowAction">
                        <Link
                          href={rowUrl(row)}
                          aria-label={getRowLabel ? `Open ${getRowLabel(row)}` : "Open record"}
                        >
                          Open
                          <ChevronRight className="size-3" />
                        </Link>
                      </span>
                    </td>
                  ) : null}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={colCount} className="shTableEmptyCell">
                  <div className="py-10 px-6">
                    <EmptyState
                      variant="no-records"
                      message={emptyMessage ?? EMPTY_NO_RECORDS}
                      hint={emptyHint ?? EMPTY_HINT_DEFAULT}
                      action={emptyAction ?? undefined}
                    />
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {hasPagination ? (
        <GlassPagination
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      ) : null}
    </section>
  );
}
