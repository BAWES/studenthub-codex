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
    <section className="tableSurface">
      <div className="tableHeader">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <span>{rows.length} shown</span>
      </div>
      <div className="tableScroller">
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
                    <TableCell className="rowAction" data-label="Action">
                      <Link href={rowHref(row)}>Open</Link>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            ) : (
              <TableRow className="emptyTableRow">
                <TableCell colSpan={columns.length + (rowHref ? 1 : 0)}>
                  <div className="emptyState">
                    <strong>No records found</strong>
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
