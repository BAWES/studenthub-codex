import type { ReactNode } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export type DataTableColumn<T> = {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
};

export function DataTable<T extends { id: string | number }>({
  title,
  description,
  rows,
  columns,
  rowHref
}: {
  title: string;
  description: string;
  rows: T[];
  columns: DataTableColumn<T>[];
  rowHref?: (row: T) => Route;
}) {
  return (
    <Card className="mt-5">
      <div className="flex items-center justify-between gap-4.5 px-4.5 py-[18px] border-b border-border">
        <div>
          <h2 className="mb-1 text-lg font-semibold">{title}</h2>
          <p className="text-muted-foreground text-sm mb-0">{description}</p>
        </div>
        <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">{rows.length} shown</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[860px]">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wide px-4 py-3 border-b border-border"
                >
                  {column.label}
                </th>
              ))}
              {rowHref ? <th aria-label="Open record" className="w-px whitespace-nowrap px-4 py-3 border-b border-border" /> : null}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-b-0">
                  {columns.map((column) => (
                    <td data-label={column.label} key={column.key} className="px-4 py-3 text-sm text-foreground align-top border-b border-border last:border-b-0">
                      {column.render(row)}
                    </td>
                  ))}
                  {rowHref ? (
                    <td data-label="Action" className="w-px whitespace-nowrap px-4 py-3 align-middle">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={rowHref(row)}>Open</Link>
                      </Button>
                    </td>
                  ) : null}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (rowHref ? 1 : 0)} className="px-4 py-8 text-center">
                  <div className="grid gap-1.5 text-muted-foreground">
                    <strong className="text-foreground text-[15px]">No records found</strong>
                    <span className="text-sm">This view is connected to the prod clone, but this account has no matching rows yet.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
