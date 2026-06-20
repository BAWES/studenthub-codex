"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { listEvaluations } from "../actions";

import type { SessionUser } from "@/modules/auth/types";
import type { EvaluationRow } from "../schemas";

type Props = {
  session: SessionUser;
  initialEvaluations: EvaluationRow[];
  initialTotal: number;
  initialPage: number;
  initialTotalPages: number;
  initialSearch: string;
};

export function AdminEvaluationsTable({
  session,
  initialEvaluations,
  initialTotal,
  initialPage,
  initialTotalPages,
  initialSearch,
}: Props) {
  const router = useRouter();
  const [evaluations, setEvaluations] = useState<EvaluationRow[]>(initialEvaluations);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [search, setSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [loading, setLoading] = useState(false);

  const fetchPage = useCallback(async (p: number, q: string) => {
    setLoading(true);
    try {
      const result = await listEvaluations({ page: p, limit: 20, search: q || undefined });
      setEvaluations(result.items);
      setTotal(result.total);
      setPage(result.page);
      setTotalPages(result.totalPages);
      setSearch(q);
      // Update URL without full navigation
      const url = new URL(window.location.href);
      if (q) {
        url.searchParams.set("search", q);
      } else {
        url.searchParams.delete("search");
      }
      url.searchParams.set("page", String(p));
      window.history.replaceState({}, "", url.toString());
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(() => {
    fetchPage(1, searchInput);
  }, [searchInput, fetchPage]);

  const handleClear = useCallback(() => {
    setSearchInput("");
    fetchPage(1, "");
  }, [fetchPage]);

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Manage evaluations — candidate performance and assessment records."
      metrics={[
        { label: "Total evaluations", value: total, note: "Evaluation records in the system" },
        { label: "Page", value: `${page} of ${totalPages}`, note: `Showing ${evaluations.length} results` },
      ]}
    >
      {/* Search bar */}
      <section className="mb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              placeholder="Search by candidate or staff name..."
              className="h-9 w-full rounded-lg pl-9 pr-3 text-sm border bg-card border-border text-foreground"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            className="h-9 rounded-lg px-4 text-sm font-semibold bg-primary text-primary-foreground"
          >
            {loading ? "Searching..." : "Search"}
          </button>
          {search ? (
            <button
              type="button"
              onClick={handleClear}
              className="h-9 rounded-lg px-3 text-xs text-muted-foreground"
            >
              Clear
            </button>
          ) : null}
          {search ? (
            <span className="text-xs text-muted-foreground">
              Results for: &ldquo;{search}&rdquo;
            </span>
          ) : null}
        </div>
      </section>

      <DataTable
        title="Evaluations"
        description="All candidate evaluations."
        rows={evaluations.map((e) => ({ ...e, id: e.can_eval_uuid }))}
        rowHref="/admin/evaluations/"
        columns={[
          {
            key: "candidate_name",
            label: "Candidate",
            render: (row) => (
              <span className="text-sm font-medium text-foreground">
                {row.candidate_name ?? "—"}
              </span>
            ),
          },
          {
            key: "staff_name",
            label: "Evaluator",
            render: (row) => (
              <span className="text-sm text-foreground">
                {row.staff_name ?? "—"}
              </span>
            ),
          },
          {
            key: "dept_id",
            label: "Department",
            render: (row) => (
              <span className="text-sm text-muted-foreground">
                {row.dept_id ?? "—"}
              </span>
            ),
          },
          {
            key: "start_date",
            label: "Start date",
            render: (row) => {
              if (!row.start_date) return "—";
              return new Date(row.start_date).toLocaleDateString();
            },
          },
          {
            key: "end_date",
            label: "End date",
            render: (row) => {
              if (!row.end_date) return "—";
              return new Date(row.end_date).toLocaleDateString();
            },
          },
          {
            key: "updated_at",
            label: "Updated",
            render: (row) => {
              if (!row.updated_at) return "—";
              return new Date(row.updated_at).toLocaleDateString();
            },
          },
        ]}
      />

      {/* Pagination */}
      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => fetchPage(page - 1, search)}
            className="h-8 rounded px-3 text-xs font-medium disabled:opacity-30 bg-card border border-border text-foreground"
          >
            Previous
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 7) {
              pageNum = i + 1;
            } else if (page <= 4) {
              pageNum = i + 1;
            } else if (page >= totalPages - 3) {
              pageNum = totalPages - 6 + i;
            } else {
              pageNum = page - 3 + i;
            }
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => fetchPage(pageNum, search)}
                disabled={loading}
                className={`h-8 w-8 rounded text-xs font-medium ${
                  pageNum === page
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground border border-border"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => fetchPage(page + 1, search)}
            className="h-8 rounded px-3 text-xs font-medium disabled:opacity-30 bg-card border border-border text-foreground"
          >
            Next
          </button>
        </div>
      ) : null}
    </WorkspaceShell>
  );
}
