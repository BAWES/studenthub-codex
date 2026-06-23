"use client";

import type { InvoiceDetail } from "../schemas";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// InvoiceDetailDrawer
// ---------------------------------------------------------------------------
// Slide-out drawer showing full invoice detail with candidate payouts.
// ---------------------------------------------------------------------------

export type InvoiceDetailDrawerProps = {
  detail: InvoiceDetail | null;
  loading: boolean;
  open: boolean;
  onClose: () => void;
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function InvoiceDetailDrawer({
  detail,
  loading,
  open,
  onClose,
}: InvoiceDetailDrawerProps) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-200 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className="fixed top-0 right-0 z-50 h-full w-full max-w-lg overflow-y-auto border-l border-border bg-card shadow-xl transition-transform duration-300"
        style={{
          transform: open ? "translateX(0)" : "translateX(100%)",
        }}
        role="dialog"
        aria-label="Invoice detail"
      >
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : !detail || !detail.invoice ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <span className="text-4xl">📄</span>
              <p className="text-lg font-semibold text-foreground">Invoice not found</p>
              <Button variant="default" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Invoice #{detail.invoice.invoice_id}
                  </h2>
                  <p className="text-sm mt-1 text-muted-foreground">
                    {detail.invoice.company?.company_name ?? "Unknown company"}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-lg hover:bg-white/10 transition-colors text-muted-foreground"
                  aria-label="Close drawer"
                >
                  ✕
                </button>
              </div>

              {/* Detail fields */}
              <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-border">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-1 text-muted-foreground">Status</p>
                  <p className="text-sm font-medium text-foreground">
                    {detail.invoice.invoice_status
                      ? detail.invoice.invoice_status.charAt(0).toUpperCase() + detail.invoice.invoice_status.slice(1)
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-1 text-muted-foreground">Date</p>
                  <p className="text-sm text-foreground">{formatDate(detail.invoice.invoice_date)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-1 text-muted-foreground">Total</p>
                  <p className="text-sm font-medium text-foreground">
                    {detail.invoice.total ? `${detail.invoice.total} ${detail.invoice.currency_code ?? "KWD"}` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-1 text-muted-foreground">Company Total</p>
                  <p className="text-sm text-foreground">
                    {detail.invoice.company_total ? `${detail.invoice.company_total} ${detail.invoice.currency_code ?? "KWD"}` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-1 text-muted-foreground">Payment Received</p>
                  <p className="text-sm text-foreground">{formatDate(detail.invoice.payment_received_on)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-1 text-muted-foreground">Transfer ID</p>
                  <p className="text-sm font-mono text-foreground">{detail.invoice.transfer_id ?? "—"}</p>
                </div>
              </div>

              {/* Metrics */}
              {detail.metrics.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-3 text-muted-foreground">Overview</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {detail.metrics.map((m) => (
                      <div
                        key={m.label}
                        className="rounded-lg border p-3 bg-white"
                        
                      >
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{m.label}</p>
                        <p className="text-lg font-bold mt-1 text-accent">{m.value}</p>
                        {m.note && (
                          <p className="text-xs mt-0.5 text-muted-foreground">{m.note}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Candidate Payouts */}
              {detail.candidate_payouts.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-3 text-muted-foreground">
                    Candidate Payouts ({detail.candidate_payouts.length})
                  </h3>
                  <div className="space-y-2">
                    {detail.candidate_payouts.map((cp) => (
                      <div
                        key={cp.tc_id}
                        className="flex items-center justify-between rounded-lg border p-3 bg-white"
                        
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {cp.candidate_name ?? "Unknown candidate"}
                          </p>
                          <p className="text-xs mt-0.5 text-muted-foreground">
                            {cp.hours != null ? `${cp.hours}h` : "—"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">
                            {cp.amount ? `${cp.amount} KWD` : "—"}
                          </p>
                          <span
                            className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mt-1 ${
                              cp.paid ? "bg-green-500/15 text-green-600" : "bg-red-500/10 text-red-500"
                            }`}
                          >
                            {cp.paid ? "Paid" : "Unpaid"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
