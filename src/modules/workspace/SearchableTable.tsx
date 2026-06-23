"use client";

import { useState, useMemo, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";

// Re-export DataTable types for convenience
import { DataTable, type DataTableColumn } from "./DataTable";

interface SearchableTableProps<T extends { id: string | number }> {
  title: string;
  description: string;
  rows: T[];
  columns: DataTableColumn<T>[];
  rowHref?: (row: T) => string;
  searchPlaceholder?: string;
  /** Keys to search against — defaults to all column keys */
  searchKeys?: string[];
}

/**
 * Client component that wraps DataTable with a client-side search filter.
 * Searches across stringified values of the specified keys (or all columns).
 * Falls through to the DataTable's empty state when no results match.
 */
export function SearchableTable<T extends { id: string | number }>({
  title,
  description,
  rows,
  columns,
  rowHref,
  searchPlaceholder = "Search…",
  searchKeys,
}: SearchableTableProps<T>) {
  const [query, setQuery] = useState("");

  const keys = searchKeys ?? columns.map((c) => c.key);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter((row) =>
      keys.some((key) => {
        const val = (row as Record<string, unknown>)[key];
        return val != null && String(val).toLowerCase().includes(q);
      })
    );
  }, [rows, query, keys]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder={searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <DataTable
        title={title}
        description={description}
        rows={filtered}
        columns={columns}
        rowHref={rowHref as any}
      />
    </div>
  );
}
