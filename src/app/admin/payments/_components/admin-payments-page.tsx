"use client";

import { useState, useCallback, useEffect } from "react";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SessionUser } from "@/modules/auth/types";
import { PaymentMetricCards } from "./payment-metric-cards";
import { PaymentFilters, type PaymentFilterValues } from "./payment-filters";
import { PaymentDataTable } from "./payment-data-table";
import { PaymentDetailDrawer } from "./payment-detail-drawer";
import { listPayments, getPayment } from "../actions";
import type { PaymentRow } from "../schemas";

// ---------------------------------------------------------------------------
// AdminPaymentsPage
// ---------------------------------------------------------------------------

export default function AdminPaymentsPage({ session }: { session: SessionUser }) {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PaymentFilterValues>({
    status: "", type: "", dateFrom: "", dateTo: "",
  });
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [selectedLineItems, setSelectedLineItems] = useState<any[]>([]);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const thisMonthVolume = payments.filter((p) => {
    const d = new Date(p.date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;
  const unreconciledCount = payments.filter((p) => !p.is_reconciled).length;
  const avgAmount = payments.length > 0
    ? payments.reduce((sum, p) => sum + (p.total ?? 0), 0) / payments.length
    : 0;

  const fetchPayments = useCallback(async (pageNum: number, currentFilters: PaymentFilterValues) => {
    setLoading(true);
    setError(null);
    try {
      const result = await listPayments({
        page: pageNum, limit: 20,
        status: currentFilters.status || undefined,
        type: currentFilters.type || undefined,
        dateFrom: currentFilters.dateFrom || undefined,
        dateTo: currentFilters.dateTo || undefined,
      });
      setPayments(result.items);
      setTotal(result.total);
      setPage(result.page);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPayments(1, filters); /* eslint-disable-line */ }, []);

  const handleApply = useCallback(() => fetchPayments(1, filters), [fetchPayments, filters]);
  const handleClear = useCallback(() => {
    const cleared: PaymentFilterValues = { status: "", type: "", dateFrom: "", dateTo: "" };
    setFilters(cleared);
    fetchPayments(1, cleared);
  }, [fetchPayments]);
  const handleRowClick = useCallback(async (payment: PaymentRow) => {
    setDrawerLoading(true);
    setDrawerOpen(true);
    try {
      const detail = await getPayment(payment.bank_transaction_id);
      setSelectedPayment(detail.payment);
      setSelectedLineItems(detail.line_items);
    } catch {
      setSelectedPayment(null);
      setSelectedLineItems([]);
    } finally {
      setDrawerLoading(false);
    }
  }, []);
  const handlePageChange = useCallback((newPage: number) => fetchPayments(newPage, filters), [fetchPayments, filters]);
  const handleRetry = useCallback(() => fetchPayments(page, filters), [fetchPayments, page, filters]);

  const isFiltered = !!(filters.status || filters.type || filters.dateFrom || filters.dateTo);
  const emptyResult: boolean = !loading && !error && total === 0 && isFiltered;

  return (
    <>
      <WorkspaceShell session={session} eyebrow="Admin" title="Payments" metrics={[]}>
        <PaymentMetricCards
          totalTransactions={total}
          thisMonthVolume={thisMonthVolume}
          unreconciledCount={unreconciledCount}
          avgAmount={avgAmount}
        />
        <PaymentFilters
          filters={filters}
          onFilterChange={setFilters}
          onApply={handleApply}
          onClear={handleClear}
          emptyResult={emptyResult}
        />
        <PaymentDataTable
          payments={payments}
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
      <PaymentDetailDrawer
        payment={selectedPayment}
        lineItems={selectedLineItems}
        loading={drawerLoading}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
