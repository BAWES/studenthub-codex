"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { listMailLogs } from "@/modules/mail-logs/actions";

import type { SessionUser } from "@/modules/auth/types";
import type { MailLogListItem } from "@/modules/mail-logs/schemas";

type Props = {
  session: SessionUser;
  initialRecords: MailLogListItem[];
};

export function AdminMailLogTable({ session, initialRecords }: Props) {
  const router = useRouter();
  const [records, setRecords] = useState<MailLogListItem[]>(initialRecords);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(initialRecords.length);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const limit = 50;

  // ── Fetch records ────────────────────────────────────────────

  const fetchRecords = useCallback(
    async (q: string, p: number) => {
      setLoading(true);
      setError(null);
      try {
        const result = await listMailLogs({ search: q || undefined, page: p, limit });
        setRecords(result.records);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load mail log");
        setRecords([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ── Search ───────────────────────────────────────────────────

  function handleSearch(q: string) {
    setSearchQuery(q);
    setPage(1);
    fetchRecords(q, 1);
  }

  // ── Pagination ───────────────────────────────────────────────

  function handlePageChange(newPage: number) {
    setPage(newPage);
    fetchRecords(searchQuery, newPage);
  }

  // ── Row click → navigate to detail ──────────────────────────

  function handleRowClick(row: MailLogListItem) {
    router.push(`/admin/mail-log/${row.mail_uuid}`);
  }

  // ── Load initial on mount (if page was modified client-side) ─

  useEffect(() => {
    fetchRecords(searchQuery, page);
    // only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Columns ──────────────────────────────────────────────────

  const columns = useMemo(
    () => [
      {
        header: "UUID",
        cell: (row: MailLogListItem) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.mail_uuid?.substring(0, 8) ?? "—"}…
          </span>
        ),
      },
      {
        header: "Subject",
        cell: (row: MailLogListItem) => (
          <span className="text-sm font-medium text-foreground">
            {row.subject ?? "—"}
          </span>
        ),
      },
      {
        header: "From",
        cell: (row: MailLogListItem) => (
          <span className="text-sm text-foreground">
            {row.from ?? "—"}
          </span>
        ),
        className: "hidden md:table-cell",
      },
      {
        header: "To",
        cell: (row: MailLogListItem) => (
          <span className="text-sm text-foreground">
            {row.to ?? "—"}
          </span>
        ),
        className: "hidden md:table-cell",
      },
      {
        header: "App",
        cell: (row: MailLogListItem) => (
          <Badge variant="secondary">{row.app ?? "—"}</Badge>
        ),
        className: "hidden sm:table-cell",
      },
      {
        header: "Sent at",
        cell: (row: MailLogListItem) => {
          if (!row.created_at) return "—";
          return new Date(row.created_at).toLocaleString();
        },
        className: "hidden lg:table-cell",
      },
    ],
    [],
  );

  // ── Render ──────────────────────────────────────────────────

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Mail log — view all outgoing emails sent by the system."
      metrics={[
        { label: "Total emails", value: total, note: "Mail log entries" },
      ]}
    >
      {/* Toolbar: search */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="relative w-full max-w-xs">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            placeholder="Search by to, from, or subject…"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8 text-xs h-8"
          />
        </div>
      </div>

      {/* Data table */}
      <DataTable
        columns={columns}
        rows={records}
        rowKey={(row) => row.mail_uuid}
        onRowClick={handleRowClick}
        loading={loading}
        error={error}
        emptyTitle="No mail log entries found"
        emptyDescription={
          searchQuery
            ? `No emails match "${searchQuery}". Try a different search term.`
            : "The mail log is empty. Emails will appear here once the system sends them."
        }
        skeletonRows={8}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 mt-4">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages} — {total} total entries
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
}
