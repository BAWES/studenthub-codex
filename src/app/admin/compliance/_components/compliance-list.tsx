"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import type {
  ComplianceSummary,
  ComplianceRow,
  CompanyComplianceDetail,
  IdRequestComplianceDetail,
} from "../schemas";
import { ComplianceDetailPanel } from "./compliance-detail-panel";

import { listComplianceRecords } from "../actions";

// ── Type filter tabs ──────────────────────────────────────────────

const TYPE_TABS = [
  { key: "all" as const, label: "All Records" },
  { key: "company" as const, label: "Companies" },
  { key: "id_request" as const, label: "ID Requests" },
  { key: "candidate" as const, label: "Candidates" },
] as const;

// ── Helpers ────────────────────────────────────────────────────────

function statusLevel(status: string): "success" | "warning" | "error" | "info" | "neutral" {
  const s = status.toLowerCase();
  if (s.includes("approved") || s === "approved") return "success";
  if (s.includes("rejected") || s.includes("denied")) return "error";
  if (s === "pending" || s.includes("unapproved") || s.includes("not approved")) return "warning";
  if (s.includes("incomplete")) return "info";
  return "neutral";
}

// ── Component ──────────────────────────────────────────────────────

export function ComplianceList({
  initialSummary,
}: {
  initialSummary: ComplianceSummary;
}) {
  const [typeFilter, setTypeFilter] = useState<"all" | "company" | "id_request" | "candidate">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [rows, setRows] = useState<ComplianceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<ComplianceRow | null>(null);
  const [detailData, setDetailData] = useState<
    CompanyComplianceDetail | IdRequestComplianceDetail | null
  >(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ── Fetch records ──────────────────────────────────────────────

  const fetchRecords = useCallback(async (type: typeof typeFilter, q: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await listComplianceRecords({
        type,
        q: q || undefined,
        limit: 60,
      });
      setRows(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load compliance records");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial data on mount
  useEffect(() => {
    fetchRecords("all", "");
  }, [fetchRecords]);

  // ── Type filter change ─────────────────────────────────────────

  function handleTypeChange(type: typeof typeFilter) {
    setTypeFilter(type);
    setSelectedRow(null);
    setDetailData(null);
    fetchRecords(type, searchQuery);
  }

  // ── Search ─────────────────────────────────────────────────────

  function handleSearch(q: string) {
    setSearchQuery(q);
    fetchRecords(typeFilter, q);
  }

  // ── Row click → fetch detail ───────────────────────────────────

  async function handleRowClick(row: ComplianceRow) {
    setSelectedRow(row);
    setDetailLoading(true);
    setDetailData(null);
    try {
      const id = row.id.replace(/^(company|candidate)-/, "");
      const mod = await import("../actions");
      const result = await mod.getComplianceRecord({ id, type: row.type });
      setDetailData(result);
    } catch {
      setDetailData(null);
    } finally {
      setDetailLoading(false);
    }
  }

  // ── After approve/deny, refresh ────────────────────────────────

  function handleActionDone() {
    setSelectedRow(null);
    setDetailData(null);
    fetchRecords(typeFilter, searchQuery);
  }

  const columns = useMemo(
    () => [
      {
        header: "Record",
        cell: (row: ComplianceRow) => (
          <div>
            <div className="font-medium text-sm text-foreground">
              {row.title}
            </div>
            <div className="text-xs mt-0.5 text-muted-foreground">
              {row.subtitle}
            </div>
          </div>
        ),
      },
      {
        header: "Type",
        cell: (row: ComplianceRow) => (
          <span className="text-xs capitalize text-muted-foreground">
            {row.type.replace("_", " ")}
          </span>
        ),
      },
      {
        header: "Status",
        cell: (row: ComplianceRow) => (
          <StatusBadge status={statusLevel(row.status)} showDot size="sm">
            {row.status}
          </StatusBadge>
        ),
      },
      {
        header: "Updated",
        cell: (row: ComplianceRow) => (
          <span className="text-xs text-muted-foreground">
            {row.updated}
          </span>
        ),
        className: "hidden md:table-cell",
      },
    ],
    [],
  );

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4">
      {/* ── Left pane: list ───────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-white p-0 overflow-hidden">
        {/* Toolbar: filter tabs + search */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b"
          
        >
          {/* Type filter tabs */}
          <div className="flex gap-1 flex-wrap">
            {TYPE_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTypeChange(tab.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 ${
                  typeFilter === tab.key
                    ? "bg-muted text-foreground border border-border"
                    : "bg-transparent text-muted-foreground border border-transparent"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-56">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              placeholder="Search records…"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8 text-xs h-8"
            />
          </div>
        </div>

        {/* Records table */}
        <div className="p-1">
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(row) => row.id}
            onRowClick={handleRowClick}
            loading={loading}
            error={error}
            emptyTitle="No compliance records found"
            emptyDescription={
              typeFilter === "all"
                ? "No pending compliance records at this time."
                : `No ${typeFilter.replace("_", " ")} records matching your criteria.`
            }
            skeletonRows={6}
          />
        </div>
      </div>

      {/* ── Right pane: detail panel ──────────────────────────── */}
      <ComplianceDetailPanel
        selectedRow={selectedRow}
        detailData={detailData}
        loading={detailLoading}
        onActionDone={handleActionDone}
      />
    </div>
  );
}
