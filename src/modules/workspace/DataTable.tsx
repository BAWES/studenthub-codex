import type { ReactNode } from "react";
import type { Route } from "next";
import Link from "next/link";
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
import { EmptyState } from "@/components/ui/empty-state";

export type DataTableColumn<T> = {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
};

function resolveHref<T>(href: ((row: T) => Route) | string | undefined, row: T): Route | string | undefined {
  if (typeof href === "function") return href(row);
  return href;
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
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <span className="text-sm text-muted-foreground whitespace-nowrap">{rows.length} shown</span>
      </CardHeader>
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
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + (rowHref ? 1 : 0)} className="h-32 text-center">
                <div className="py-14 px-6">
                  <EmptyState
                    variant="empty"
                    title="No records found"
                    description="This view has no matching rows yet."
                  />
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
