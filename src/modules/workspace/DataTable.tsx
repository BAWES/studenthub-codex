import type { ReactNode } from "react";
import type { Route } from "next";
import Link from "next/link";

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
                <td colSpan={columns.length + (rowHref ? 1 : 0)}>
                  <div className="emptyState">
                    <strong>No records found</strong>
                    <span>This view is connected to the prod clone, but this account has no matching rows yet.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
