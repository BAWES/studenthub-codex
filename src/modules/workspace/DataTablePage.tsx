"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { DataTable, type DataTableColumn } from "./DataTable";
import type { Route } from "next";

type DataTablePageProps<T extends { id: string | number }> = {
  title: string;
  description: string;
  rows: T[];
  columns: DataTableColumn<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  rowHref?: (row: T) => Route;
  searchKeys?: (keyof T)[];
};

/**
 * Searchable data table page wrapper.
 * Adds a search/filter input above the DataTable.
 * By default searches through all string/number column render outputs.
 */
export function DataTablePage<T extends { id: string | number }>({
  title,
  description,
  rows,
  columns,
  searchable = false,
  searchPlaceholder = "Search...",
  rowHref,
  searchKeys,
}: DataTablePageProps<T>) {
  const [query, setQuery] = useState("");

  const filtered = searchable && query.trim()
    ? rows.filter((row) => {
        const q = query.toLowerCase();
        // If explicit searchKeys provided, use those
        if (searchKeys && searchKeys.length) {
          return searchKeys.some((key) => {
            const val = row[key];
            return val != null && String(val).toLowerCase().includes(q);
          });
        }
        // Otherwise search through all columns' rendered text
        return columns.some((col) => {
          const rendered = col.render(row);
          if (rendered == null) return false;
          // Extract text from React nodes
          const text = extractText(rendered);
          return text.toLowerCase().includes(q);
        });
      })
    : rows;

  return (
    <div className="grid gap-3">
      {searchable ? (
        <div className="flex items-center gap-2">
          <Input
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-sm"
          />
          <span className="text-sm text-muted-foreground">
            {filtered.length} of {rows.length} shown
          </span>
        </div>
      ) : null}
      <DataTable
        title={title}
        description={description}
        rows={filtered}
        columns={columns}
        rowHref={rowHref}
      />
    </div>
  );
}

/** Recursively extract text from a React render result. */
function extractText(node: React.ReactNode): string {
  if (node == null) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join(" ");
  // React element — cast to access props.children
  try {
    const el = node as React.ReactElement<{ children?: React.ReactNode }>;
    if (el.props?.children) return extractText(el.props.children);
  } catch {
    /* ignore non-element types */
  }
  return "";
}
