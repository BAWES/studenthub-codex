import type { ReactNode } from "react";
import type { Route } from "next";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DataTableColumn<T> = {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
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
    <div className="pagination">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </button>
      <span>Page {page} of {totalPages}</span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
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
  emptyAction,
  error,
  onRetry,
  totalPages,
  page = 1,
  onPageChange,
  pageSize,
}: DataTableProps<T>) {
  const colCount = columns.length + (rowHref ? 1 : 0);

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
          <table>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
                {rowHref ? <th aria-label="Open record" /> : null}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: loadingSkeletonRows }).map((_, rowIdx) => (
                <tr key={rowIdx}>
                  {columns.map((column) => (
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
          <table>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
                {rowHref ? <th aria-label="Open record" /> : null}
              </tr>
            </thead>
            <tbody>
              <tr className="emptyTableRow">
                <td colSpan={colCount}>
                  <div className="errorState">
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
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
              {rowHref ? <th aria-label="Open record" /> : null}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row) => (
                <tr key={row.id}>
                  {columns.map((column) => (
                    <td data-label={column.label} key={column.key}>
                      {column.render(row)}
                    </td>
                  ))}
                  {rowHref ? (
                    <td className="rowAction" data-label="Action">
                      <Link href={rowHref(row)}>Open</Link>
                    </td>
                  ) : null}
                </tr>
              ))
            ) : (
              <tr className="emptyTableRow">
                <td colSpan={colCount}>
                  <div className="emptyState">
                    <strong>
                      {emptyMessage ?? "No records found"}
                    </strong>
                    <span>
                      This view is connected to the prod clone, but this account has no matching rows yet.
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
