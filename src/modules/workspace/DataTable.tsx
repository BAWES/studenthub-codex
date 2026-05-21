import type { ReactNode } from "react";
import type { Route } from "next";
import Link from "next/link";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table";

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
    <section className="border border-[#dfe4ed] rounded-lg bg-white dark:border-[var(--line)] dark:bg-[var(--surface)]">
      <div className="min-h-[76px] flex items-center justify-between gap-[18px] p-[18px] border-b border-[var(--line)]">
        <div>
          <h2 className="mb-1">{title}</h2>
          <p className="text-[var(--muted)] mb-0">{description}</p>
        </div>
        <span className="text-[var(--muted)] text-[13px] font-bold">{rows.length} shown</span>
      </div>
      <div className="overflow-x-auto">
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
            {rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((column) => (
                    <TableCell data-label={column.label} key={column.key}>
                      {column.render(row)}
                    </TableCell>
                  ))}
                  {rowHref ? (
                    <TableCell className="w-[1%] whitespace-nowrap" data-label="Action">
                      <Link
                        className="inline-flex min-h-9 items-center justify-center border border-[var(--line)] px-3.5 text-[var(--blue)] text-[13px] font-extrabold no-underline hover:border-[var(--blue)] hover:bg-[#eef5ff]"
                        href={rowHref(row)}
                      >
                        Open
                      </Link>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="p-0" colSpan={columns.length + (rowHref ? 1 : 0)}>
                  <div className="grid gap-1.5 p-[18px] text-[var(--muted)]">
                    <strong className="text-[var(--ink)] text-[15px]">No records found</strong>
                    <span>This view is connected to the prod clone, but this account has no matching rows yet.</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
