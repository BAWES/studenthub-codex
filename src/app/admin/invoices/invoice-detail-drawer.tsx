"use client";

import type { InvoiceDetail } from "./schemas";

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
        className="fixed inset-0 z-40 transition-opacity duration-200"
        style={{ background: "rgba(0,0,0,0.4)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className="fixed top-0 right-0 z-50 h-full w-full max-w-lg overflow-y-auto border-l shadow-xl transition-transform duration-300"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          transform: open ? "translateX(0)" : "translateX(100%)",
        }}
        role="dialog"
        aria-label="Invoice detail"
      >
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <p style={{ color: "var(--muted)" }}>Loading...</p>
            </div>
          ) : !detail || !detail.invoice ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <span className="text-4xl">📄</span>
              <p className="text-lg font-semibold" style={{ color: "var(--ink)" }}>Invoice not found</p>
              <button
                onClick={onClose}
                className="h-10 rounded-lg px-4 text-sm font-semibold"
                style={{ background: "var(--sh-info)", color: "#fff" }}
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold" style={{ color: "var(--ink)" }}>
                    Invoice #{detail.invoice.invoice_id}
                  </h2>
                  <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                    {detail.invoice.company?.company_name ?? "Unknown company"}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-lg hover:bg-white/10 transition-colors"
                  style={{ color: "var(--muted)" }}
                  aria-label="Close drawer"
                >
                  ✕
                </button>
              </div>

              {/* Detail fields */}
              <div className="grid grid-cols-2 gap-4 mb-6 pb-6" style={{ borderBottom: "1px solid var(--border)" }}>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--muted)" }}>Status</p>
                  <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>
                    {detail.invoice.invoice_status
                      ? detail.invoice.invoice_status.charAt(0).toUpperCase() + detail.invoice.invoice_status.slice(1)
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--muted)" }}>Date</p>
                  <p className="text-sm" style={{ color: "var(--ink)" }}>{formatDate(detail.invoice.invoice_date)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--muted)" }}>Total</p>
                  <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>
                    {detail.invoice.total ? `${detail.invoice.total} ${detail.invoice.currency_code ?? "KWD"}` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--muted)" }}>Company Total</p>
                  <p className="text-sm" style={{ color: "var(--ink)" }}>
                    {detail.invoice.company_total ? `${detail.invoice.company_total} ${detail.invoice.currency_code ?? "KWD"}` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--muted)" }}>Payment Received</p>
                  <p className="text-sm" style={{ color: "var(--ink)" }}>{formatDate(detail.invoice.payment_received_on)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--muted)" }}>Transfer ID</p>
                  <p className="text-sm font-mono" style={{ color: "var(--ink)" }}>{detail.invoice.transfer_id ?? "—"}</p>
                </div>
              </div>

              {/* Metrics */}
              {detail.metrics.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: "var(--muted)" }}>Overview</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {detail.metrics.map((m) => (
                      <div
                        key={m.label}
                        className="rounded-lg border p-3 bg-white"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>{m.label}</p>
                        <p className="text-lg font-bold mt-1" style={{ color: "var(--accent)" }}>{m.value}</p>
                        {m.note && (
                          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{m.note}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Candidate Payouts */}
              {detail.candidate_payouts.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: "var(--muted)" }}>
                    Candidate Payouts ({detail.candidate_payouts.length})
                  </h3>
                  <div className="space-y-2">
                    {detail.candidate_payouts.map((cp) => (
                      <div
                        key={cp.tc_id}
                        className="flex items-center justify-between rounded-lg border p-3 bg-white"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>
                            {cp.candidate_name ?? "Unknown candidate"}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                            {cp.hours != null ? `${cp.hours}h` : "—"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>
                            {cp.amount ? `${cp.amount} KWD` : "—"}
                          </p>
                          <span
                            className="inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mt-1"
                            style={{
                              background: cp.paid ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.1)",
                              color: cp.paid ? "#22c55e" : "#ef4444",
                            }}
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
