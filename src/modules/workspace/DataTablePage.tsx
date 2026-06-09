"use client";

import { useState, useMemo } from "react";
import type { ReactNode } from "react";
import type { Route } from "next";
import { DataTable, type DataTableColumn } from "./DataTable";
import { DataTableSkeleton } from "./Skeletons";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import {
  EMPTY_NO_RECORDS,
  EMPTY_HINT_DEFAULT,
  emptyNoResults,
} from "./emptyStates";

// ── Types ──────────────────────────────────────────────────

export type {
  DataTableColumn,
};

export type DataTablePageProps<T extends { id: string | number }> = {
  /** Page title shown in the header. */
  title: string;
  /** Page description / subtitle. */
  description: string;
  /** Column definitions for the data table. */
  columns: DataTableColumn<T>[];
  /** Row data. */
  rows: T[];
  /** Optional href factory for clickable rows. */
  rowHref?: (row: T) => Route;
  /** Loading state — shows skeleton when true. */
  loading?: boolean;
  /** Error message — shows error state when set. */
  error?: string | null;
  /** Whether to show the search/filter bar. */
  searchable?: boolean;
  /** Placeholder text for the search input. */
  searchPlaceholder?: string;
  /** Current search value (controlled). */
  searchValue?: string;
  /** Search change handler (controlled). */
  onSearchChange?: (value: string) => void;
  /** Total number of pages for pagination. */
  totalPages?: number;
  /** Current page number (1-indexed). */
  page?: number;
  /** Page change handler. */
  onPageChange?: (page: number) => void;
  /** Action buttons rendered in the header (e.g. "Create" button). */
  actions?: ReactNode;
  /** Optional className override. */
  className?: string;
};

// ── Default filter function ─────────────────────────────────

function defaultFilter<T>(rows: T[], query: string): T[] {
  if (!query.trim()) return rows;
  const q = query.toLowerCase();
  return rows.filter((row) =>
    Object.values(row as Record<string, unknown>)
      .filter((v): v is string | number => typeof v === "string" || typeof v === "number")
      .some((v) => String(v).toLowerCase().includes(q))
  );
}

// ── Component ──────────────────────────────────────────────

export function DataTablePage<T extends { id: string | number }>({
  title,
  description,
  columns,
  rows,
  rowHref,
  loading = false,
  error = null,
  searchable = false,
  searchPlaceholder = "Search...",
  searchValue: externalSearchValue,
  onSearchChange: externalOnSearchChange,
  totalPages,
  page = 1,
  onPageChange,
  actions,
  className,
}: DataTablePageProps<T>) {
  // Internal search state when uncontrolled
  const [internalSearch, setInternalSearch] = useState("");
  const isControlled = externalSearchValue !== undefined;
  const searchValue = isControlled ? externalSearchValue : internalSearch;
  const setSearchValue = isControlled
    ? (externalOnSearchChange ?? (() => {}))
    : setInternalSearch;

  // Filter rows by search
  const filtered = useMemo(
    () => defaultFilter(rows, searchValue),
    [rows, searchValue]
  );

  // ── Loading state ────────────────────────────────────────
  if (loading) {
    return (
      <div className={className}>
        <DataTableSkeleton rows={10} />
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────
  if (error) {
    return (
      <section className={className}>
        <div className="tableHeader">
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
        </div>
        <div className="errorState">
          <strong>Error loading data</strong>
          <span>{error}</span>
        </div>
      </section>
    );
  }

  return (
    <section className={className}>
      {/* Header row */}
      <div className="tableHeader">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        {actions ? <div className="tableActions">{actions}</div> : null}
      </div>

      {/* Search / filter bar */}
      {searchable ? (
        <div className="searchBar">
          <div className="searchInputWrap">
            <Search size={16} className="searchIcon" aria-hidden="true" />
            <input
              data-command-search
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="searchInput"
            />
            {searchValue ? (
              <button
                type="button"
                className="searchClear"
                onClick={() => setSearchValue("")}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Table */}
      {filtered.length > 0 ? (
        <DataTable
          title={title}
          description={description}
          rows={filtered}
          columns={columns}
          rowHref={rowHref}
        />
      ) : (
        <div className="emptyState">
          <strong>{EMPTY_NO_RECORDS}</strong>
          <span>
            {searchValue
              ? emptyNoResults(searchValue)
              : EMPTY_HINT_DEFAULT}
          </span>
        </div>
      )}

      {/* Pagination */}
      {totalPages && totalPages > 1 ? (
        <div className="pagination">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange?.(page - 1)}
          >
            Previous
          </Button>
          <span className="paginationInfo">Page {page} of {totalPages}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange?.(page + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </section>
  );
}
