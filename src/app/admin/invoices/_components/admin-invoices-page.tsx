"use client";

import { useState, useCallback, useEffect } from "react";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SessionUser } from "@/modules/auth/types";
import { InvoiceMetricCards } from "./invoice-metric-cards";
import { InvoiceFilters, type InvoiceFilterValues } from "./invoice-filters";
import { InvoiceDataTable } from "./invoice-data-table";
import { InvoiceDetailDrawer } from "./invoice-detail-drawer";
import { listInvoices, getInvoice } from "../actions";
import type { InvoiceRow, InvoiceDetail } from "../schemas";

// ---------------------------------------------------------------------------
// AdminInvoicesPage
// ---------------------------------------------------------------------------

export default function AdminInvoicesPage({
  session,
  initialRows = [],
  initialTotal = 0,
}: {
  session: SessionUser;
  initialRows?: InvoiceRow[];
  initialTotal?: number;
}) {
  const [invoices, setInvoices] = useState<InvoiceRow[]>(initialRows);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(Math.ceil(initialTotal / 20));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<InvoiceFilterValues>({
    status: "",
    dateFrom: "",
    dateTo: "",
  });
  const [selectedDetail, setSelectedDetail] = useState<InvoiceDetail | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const thisMonthVolume = invoices.filter((inv) => {
    if (!inv.invoice_date) return false;
    const d = new Date(inv.invoice_date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;
  const unpaidCount = invoices.filter((inv) => inv.invoice_status === "unpaid").length;

  const fetchInvoices = useCallback(
    async (pageNum: number, currentFilters: InvoiceFilterValues) => {
      setLoading(true);
      setError(null);
      try {
        const result = await listInvoices({
          page: pageNum,
          limit: 20,
          status: (currentFilters.status as "paid" | "unpaid" | undefined) || undefined,
          dateFrom: currentFilters.dateFrom || undefined,
          dateTo: currentFilters.dateTo || undefined,
        });
        setInvoices(result.items);
        setTotal(result.total);
        setPage(result.page);
        setTotalPages(result.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load invoices");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    // Don't re-fetch on mount since we have initialRows
    // Only fetch if we need to refresh
  }, []);

  const handleApply = useCallback(
    () => fetchInvoices(1, filters),
    [fetchInvoices, filters],
  );

  const handleClear = useCallback(() => {
    const cleared: InvoiceFilterValues = { status: "", dateFrom: "", dateTo: "" };
    setFilters(cleared);
    fetchInvoices(1, cleared);
  }, [fetchInvoices]);

  const handleRowClick = useCallback(
    async (invoice: InvoiceRow) => {
      setDrawerLoading(true);
      setDrawerOpen(true);
      try {
        const detail = await getInvoice(invoice.invoice_id);
        setSelectedDetail(detail);
      } catch {
        setSelectedDetail(null);
      } finally {
        setDrawerLoading(false);
      }
    },
    [],
  );

  const handlePageChange = useCallback(
    (newPage: number) => fetchInvoices(newPage, filters),
    [fetchInvoices, filters],
  );

  const handleRetry = useCallback(
    () => fetchInvoices(page, filters),
    [fetchInvoices, page, filters],
  );

  const isFiltered = !!(filters.status || filters.dateFrom || filters.dateTo);
  const emptyResult: boolean = !loading && !error && total === 0 && isFiltered;

  return (
    <>
      <WorkspaceShell session={session} eyebrow="Admin" title="Invoices" metrics={[]}>
        <InvoiceMetricCards
          totalInvoices={total}
          unpaidCount={unpaidCount}
          thisMonthVolume={thisMonthVolume}
        />
        <InvoiceFilters
          filters={filters}
          onFilterChange={setFilters}
          onApply={handleApply}
          onClear={handleClear}
          emptyResult={emptyResult}
        />
        <InvoiceDataTable
          invoices={invoices}
          total={total}
          page={page}
          totalPages={totalPages}
          loading={loading}
          error={error}
          onRowClick={handleRowClick}
          onRetry={handleRetry}
          onPageChange={handlePageChange}
        />
      </WorkspaceShell>
      <InvoiceDetailDrawer
        detail={selectedDetail}
        loading={drawerLoading}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
