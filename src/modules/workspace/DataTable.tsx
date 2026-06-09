import type { ReactNode } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Inbox, AlertCircle } from "lucide-react";
import {
  EMPTY_NO_RECORDS,
  EMPTY_HINT_DEFAULT,
} from "./emptyStates";

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
// Skeleton component
// ---------------------------------------------------------------------------

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      data-slot="skeleton"
      className={`skeleton ${className}`}
      aria-hidden="true"
    />
  );
}

// ---------------------------------------------------------------------------
// Pagination component
// ---------------------------------------------------------------------------

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        Previous
      </button>
      <span>Page {page} of {totalPages}</span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        Next
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
      <section className="tableSurface">
        <div className="tableHeader">
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
        </div>
        <div className="tableScroller">
          <table aria-label={title}>
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
                      <Skeleton />
                    </td>
                  ))}
                  {rowHref ? (
                    <td>
                      <Skeleton />
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
      <section className="tableSurface">
        <div className="tableHeader">
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
        </div>
        <div className="tableScroller">
          <table aria-label={title}>
            <thead>
              <tr>
                {visibleColumns.map((column) => (
                  <th key={column.key} scope="col">{column.label}</th>
                ))}
                {rowHref ? <th scope="col" aria-label="Open record" /> : null}
              </tr>
            </thead>
            <tbody>
              <tr className="emptyTableRow">
                <td colSpan={colCount}>
                  <div className="errorState">
                    <AlertCircle size={32} className="errorStateIcon" />
                    <strong>{error}</strong>
                    {onRetry ? (
                      <button type="button" onClick={onRetry}>
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
    <section className="tableSurface">
      <div className="tableHeader">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <span>{rowCountLabel}</span>
      </div>
      <div className="tableScroller">
        <table aria-label={title}>
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
                <tr key={row.id}>
                  {visibleColumns.map((column) => (
                    <td data-label={column.label} key={column.key}>
                      {column.render(row)}
                    </td>
                  ))}
                  {rowHref ? (
                    <td className="rowAction" data-label="Action">
                      <Link href={rowHref(row)} aria-label={getRowLabel ? `Open ${getRowLabel(row)}` : "Open record"}>Open</Link>
                    </td>
                  ) : null}
                </tr>
              ))
            ) : (
              <tr className="emptyTableRow">
                <td colSpan={colCount}>
                  <div className="emptyState">
                    <Inbox size={40} className="emptyStateIcon" />
                    <strong>
                      {emptyMessage ?? EMPTY_NO_RECORDS}
                    </strong>
                    <span>
                      {emptyHint ?? EMPTY_HINT_DEFAULT}
                    </span>
                    {emptyAction ? (
                      <button type="button" onClick={emptyAction.onClick}>
                        {emptyAction.label}
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {hasPagination ? (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      ) : null}
    </section>
  );
}
