"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { approveComplianceRecord, denyComplianceRecord } from "../actions";
import type {
  ComplianceRow,
  CompanyComplianceDetail,
  IdRequestComplianceDetail,
} from "../schemas";

// ── Detail Panel ───────────────────────────────────────────────────

export function ComplianceDetailPanel({
  selectedRow,
  detailData,
  loading,
  onActionDone,
}: {
  selectedRow: ComplianceRow | null;
  detailData: CompanyComplianceDetail | IdRequestComplianceDetail | null;
  loading: boolean;
  onActionDone: () => void;
}) {
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [showDenyForm, setShowDenyForm] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Guard: no selection
  if (!selectedRow) {
    return (
      <div className="rounded-lg border-border border bg-white p-6">
        <EmptyState
          variant="idle"
          title="No record selected"
          description="Click a compliance record to view its details and take action."
        />
      </div>
    );
  }

  // Non-null local for TypeScript narrowing
  const row = selectedRow;

  // ── Approve handler ───────────────────────────────────────────

  async function handleApprove() {
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    const id = row.id.replace(/^(company|candidate)-/, "");
    try {
      const result = await approveComplianceRecord({
        id,
        type: row.type === "candidate" ? "company" : (row.type as "company" | "id_request"),
      });
      setActionSuccess(`${row.type === "company" ? "Company" : "ID request"} approved successfully.`);
      setTimeout(onActionDone, 1500);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(false);
    }
  }

  // ── Deny handler ──────────────────────────────────────────────

  async function handleDeny() {
    if (!rejectionReason.trim()) return;
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    const id = row.id.replace(/^(company|candidate)-/, "");
    try {
      await denyComplianceRecord({
        id,
        type: row.type === "candidate" ? "company" : (row.type as "company" | "id_request"),
        reason: rejectionReason.trim(),
      });
      setActionSuccess(`${row.type === "company" ? "Company" : "ID request"} denied.`);
      setTimeout(onActionDone, 1500);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(false);
    }
  }

  // ── Detail for company ────────────────────────────────────────

  function renderCompanyDetail(detail: CompanyComplianceDetail) {
    const company = detail.company;
    if (!company) return <p className="text-xs text-muted-foreground">Company not found</p>;

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">
            {company.company_name}
          </h3>
          <p className="text-xs mt-0.5 text-muted-foreground">
            {company.company_email ?? "No email"} · ID: {company.company_id}
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2">
          {detail.metrics.map((m, i) => (
            <div
              key={i}
              className="p-2 rounded bg-muted/50"
            >
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {m.label}
              </div>
              <div className="text-sm font-bold mt-0.5 text-foreground">
                {m.value}
              </div>
              {m.note && (
                <div className="text-[10px] mt-0.5 text-muted-foreground">
                  {m.note}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Recent ID requests */}
        {detail.idRequests.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">
              Recent ID Requests
            </h4>
            <div className="space-y-1.5">
              {detail.idRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-1.5 rounded text-xs bg-muted/50"
                >
                  <span className="text-muted-foreground">{req.id.slice(0, 12)}…</span>
                  <StatusBadge
                    status={
                      req.status === "approved"
                        ? "success"
                        : req.status === "rejected"
                          ? "error"
                          : "warning"
                    }
                    showDot
                    size="sm"
                  >
                    {req.status}
                  </StatusBadge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Detail for ID request ─────────────────────────────────────

  function renderIdRequestDetail(detail: IdRequestComplianceDetail) {
    const record = detail.record;
    if (!record) return <p className="text-xs text-muted-foreground">Record not found</p>;

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">ID Request</h3>
          <p className="text-xs mt-0.5 text-muted-foreground">
            {record.cir_uuid.slice(0, 16)}…
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2">
          {detail.metrics.map((m, i) => (
            <div
              key={i}
              className="p-2 rounded bg-muted/50"
            >
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {m.label}
              </div>
              <div className="text-sm font-bold mt-0.5 text-foreground">
                {m.value}
              </div>
              {m.note && (
                <div className="text-[10px] mt-0.5 text-muted-foreground">
                  {m.note}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Candidate IDs */}
        {record.candidate_ids && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-1 text-muted-foreground">
              Candidate IDs
            </h4>
            <p className="text-xs text-foreground">{record.candidate_ids}</p>
          </div>
        )}

        {/* Rejection reason */}
        {record.rejection_reason && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-1 text-destructive">
              Rejection Reason
            </h4>
            <p className="text-xs text-destructive">
              {record.rejection_reason}
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────

  const isActionable = row.type === "company" || row.type === "id_request";

  return (
    <div className="rounded-lg border-border border bg-white p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {loading ? "Loading…" : "Record Details"}
        </h3>
        <StatusBadge status={loading ? "neutral" : "info"} size="sm" showDot={false}>
          {row.type.replace("_", " ")}
        </StatusBadge>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-3/4 bg-muted/30" />
          <Skeleton className="h-4 w-1/2 bg-muted/30" />
          <Skeleton className="h-20 w-full bg-muted/30" />
        </div>
      ) : detailData ? (
        <>
          {detailData.type === "company" && renderCompanyDetail(detailData as CompanyComplianceDetail)}
          {detailData.type === "id_request" && renderIdRequestDetail(detailData as IdRequestComplianceDetail)}

          {/* Divider */}
          <hr className="border-border" />

          {/* Actions */}
          {isActionable && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-foreground">Actions</p>

              {/* Action feedback */}
              {actionSuccess && (
                <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                  {actionSuccess}
                </p>
              )}
              {actionError && (
                <p className="text-xs text-destructive">
                  {actionError}
                </p>
              )}

              {/* Approve button */}
              <Button
                variant="default"
                size="sm"
                className="w-full"
                disabled={actionLoading || !!actionSuccess}
                onClick={handleApprove}
              >
                {actionLoading
                  ? "Processing…"
                  : `Approve ${row.type === "company" ? "to Hire" : "ID Request"}`}
              </Button>

              {/* Deny toggle */}
              {!showDenyForm ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowDenyForm(true)}
                  disabled={actionLoading || !!actionSuccess}
                >
                  Deny with reason
                </Button>
              ) : (
                <div className="space-y-2">
                  <Input
                    placeholder="Reason for denial…"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="text-xs"
                    disabled={actionLoading}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      disabled={actionLoading || !rejectionReason.trim() || !!actionSuccess}
                      onClick={handleDeny}
                    >
                      {actionLoading ? "Processing…" : "Confirm Deny"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowDenyForm(false);
                        setRejectionReason("");
                      }}
                      disabled={actionLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <p className="text-xs text-destructive">
          Failed to load record details.
        </p>
      )}
    </div>
  );
}
