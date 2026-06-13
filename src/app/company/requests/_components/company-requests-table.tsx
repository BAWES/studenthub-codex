"use client";

import Link from "next/link";
import type { Route } from "next";
import { DataTable } from "@/modules/workspace/DataTable";

interface RequestRow {
  id: string;
  title: string;
  company: string;
  owner: string;
  seats: number;
  status: string;
  updated: string;
}

const statusBadge = (status: string) => {
  const colors: Record<string, string> = {
    pending: "#f59e0b",
    started: "#3b82f6",
    delivered: "#10b981",
    cancelled: "#ef4444",
    finished_by_recruitment: "#8b5cf6",
  };
  const color = colors[status] ?? "#6b7280";
  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.125rem 0.625rem",
        borderRadius: "9999px",
        fontSize: "0.75rem",
        fontWeight: 600,
        color: "#fff",
        background: color,
        textTransform: "capitalize",
      }}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
};

export function CompanyRequestsTable({ rows }: { rows: RequestRow[] }) {
  return (
    <>
      <div style={{ marginBottom: "1rem" }}>
        <Link
          href="/company/requests/create"
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "0.5rem 1rem",
            background: "var(--primary, #2563eb)",
            color: "#fff",
            borderRadius: "6px",
            fontWeight: 600,
            fontSize: "0.875rem",
            textDecoration: "none",
          }}
        >
          + New Request
        </Link>
      </div>
      <DataTable
        title="Hiring Requests"
        description="Requests across the company accounts linked to this contact."
        rows={rows}
        rowHref={(row) => `/company/requests/${row.id}` as Route}
        columns={[
          { key: "title", label: "Request", render: (row) => <strong>{row.title}</strong> },
          { key: "company", label: "Company", render: (row) => row.company },
          { key: "owner", label: "Owner", render: (row) => row.owner },
          { key: "seats", label: "Seats", render: (row) => row.seats },
          {
            key: "status",
            label: "Status",
            render: (row) => statusBadge(row.status as string),
          },
          { key: "updated", label: "Updated", render: (row) => row.updated }
        ]}
      />
    </>
  );
}
