"use client";

import { useState, useMemo, type ReactNode } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Search, X } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type DataTableColumn<T> = {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
};

function resolveHref<T>(href: ((row: T) => Route) | string | undefined, row: T): Route | string | undefined {
  if (typeof href === "function") return href(row);
  return href;
}

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

export function DataTable<T extends { id: string | number }>({
  title,
  description,
  rows,
  columns,
  rowHref,
  loading,
  totalPages,
  page,
  onPageChange,
  searchable,
  searchPlaceholder = "Search...",
}: {
  title: string;
  description: string;
  rows: T[];
  columns: DataTableColumn<T>[];
  rowHref?: ((row: T) => Route) | string;
  loading?: boolean;
  totalPages?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  /** Whether to show the search/filter bar. */
  searchable?: boolean;
  /** Placeholder text for the search input. */
  searchPlaceholder?: string;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => defaultFilter(rows, query), [rows, query]);

  const displayRows = searchable ? filtered : rows;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <span className="text-sm text-muted-foreground whitespace-nowrap">{displayRows.length} shown</span>
      </CardHeader>

      {searchable ? (
        <div className="px-4 pb-4 border-b border-border">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <Input
              data-command-search
              type="text"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {query ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 size-7"
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                <X size={14} />
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.label}</TableHead>
            ))}
            {rowHref ? <TableHead aria-label="Open record" /> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayRows.length ? (
            displayRows.map((row) => (
              <TableRow key={row.id}>
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {column.render(row)}
                  </TableCell>
                ))}
                {rowHref ? (
                  <TableCell>
                    <Link
                      href={resolveHref(rowHref, row) as Route}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Open
                    </Link>
                  </TableCell>
                ) : null}
              </TableRow>
            ))
          ) : query ? (
            <TableRow>
              <TableCell colSpan={columns.length + (rowHref ? 1 : 0)} className="h-32 text-center">
                <div className="flex flex-col items-center gap-1 py-8">
                  <strong className="text-sm font-medium text-foreground">No results for &ldquo;{query}&rdquo;</strong>
                  <span className="text-sm text-muted-foreground max-w-xs">
                    Try a different search term or clear your filter.
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + (rowHref ? 1 : 0)} className="h-32 text-center">
                <div className="flex flex-col items-center gap-1 py-8">
                  <strong className="text-sm font-medium text-foreground">No records found</strong>
                  <span className="text-sm text-muted-foreground max-w-xs">
                    This view is connected to the prod clone, but this account has no matching rows yet.
                  </span>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
