"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type { Route } from "next";
import { Search, X } from "lucide-react";
import { DataTable, type DataTableColumn } from "./DataTable";
import { DataTableSkeleton } from "./Skeletons";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  EMPTY_NO_RECORDS,
  EMPTY_HINT_DEFAULT,
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
  /** URL string for clickable rows — passed directly to DataTable. */
  rowHref?: string;
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
  totalPages,
  page = 1,
  onPageChange,
  actions,
  className,
}: DataTablePageProps<T>) {
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
        <Card>
          <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
            <div className="size-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <X size={24} className="text-destructive" />
            </div>
            <strong className="text-sm text-foreground">
              Error loading data
            </strong>
            <span className="text-sm text-muted-foreground">
              {error}
            </span>
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section className={className}>
      <DataTable
        title={title}
        description={description}
        rows={rows}
        columns={columns}
        rowHref={rowHref}
        searchable={searchable}
        searchPlaceholder={searchPlaceholder}
        totalPages={totalPages}
        page={page}
        onPageChange={onPageChange}
      />
      {actions ? (
        <div className="flex items-center gap-2 mt-4">
          {actions}
        </div>
      ) : null}
    </section>
  );
}
