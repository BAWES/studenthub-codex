"use client";

import { useEffect, useCallback, type KeyboardEvent } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { X } from "lucide-react";

// ---------------------------------------------------------------------------
// PaymentDetailDrawer
// ---------------------------------------------------------------------------

export type PaymentDetailDrawerProps = {
  payment: {
    bank_transaction_id: string;
    reference: string | null;
    status: string | null;
    type: string | null;
    total: number | null;
    sub_total: number | null;
    total_tax: number | null;
    currency_rate: number | null;
    currency_code: string | null;
    line_amount_types: string | null;
    has_attachments: boolean | null;
    is_reconciled: boolean | null;
    date: string | null;
    created_at: string | null;
    updated_at: string | null;
    contact: { contact_id: string; name: string | null } | null;
  } | null;
  lineItems: {
    line_item_id: string;
    account_code: string | null;
    description: string | null;
    line_amount: number | null;
    quantity: number | null;
    unit_amount: number | null;
  }[];
  loading: boolean;
  open: boolean;
  onClose: () => void;
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  AUTHORISED: { bg: "rgba(34, 197, 94, 0.15)", text: "#22c55e" },
  PAID: { bg: "rgba(34, 197, 94, 0.15)", text: "#22c55e" },
  VOIDED: { bg: "rgba(239, 68, 68, 0.15)", text: "#ef4444" },
  DELETED: { bg: "rgba(239, 68, 68, 0.15)", text: "#ef4444" },
};

function formatAmount(value: number | null, currency?: string | null): string {
  if (value === null) return "—";
  return `${value.toLocaleString("en-US", { maximumFractionDigits: 3 })} ${currency ?? "KWD"}`;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1.5">
      <span className="text-sm" style={{ color: "var(--muted)" }}>{label}</span>
      <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>{value}</span>
    </div>
  );
}

export function PaymentDetailDrawer({ payment, lineItems, loading, open, onClose }: PaymentDetailDrawerProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 transition-opacity duration-200" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose} aria-hidden="true" />
      <div
        className="fixed top-0 right-0 z-50 h-full w-full sm:w-[480px] transition-transform duration-300 ease-out"
        style={{ transform: open ? "translateX(0)" : "translateX(100%)" }}
        onKeyDown={handleKeyDown}
        aria-modal="true"
        role="dialog"
        aria-label="Payment detail"
      >
        <GlassPanel variant="elevated" radius="sm" className="h-full overflow-y-auto p-6 rounded-none" style={{ borderLeft: "1px solid var(--border)" }}>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold" style={{ color: "var(--ink)" }}>
                {loading ? "Loading..." : payment?.reference ?? "No Reference"}
              </h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10" aria-label="Close payment detail">
              <X size={20} style={{ color: "var(--muted)" }} aria-hidden="true" />
            </button>
          </div>

          {loading ? (
            <div className="space-y-6" aria-hidden="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-6 rounded bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : !payment ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <span className="text-4xl">🔍</span>
              <p className="text-lg font-semibold" style={{ color: "var(--ink)" }}>Payment not found</p>
              <button onClick={onClose} className="h-10 rounded-lg px-4 text-sm font-semibold" style={{ background: "var(--sh-info)", color: "#fff" }}>
                Close
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                style={{
                  background: STATUS_COLORS[payment.status ?? ""]?.bg ?? "rgba(255,255,255,0.06)",
                  color: STATUS_COLORS[payment.status ?? ""]?.text ?? "rgba(255,255,255,0.4)",
                }}
                aria-label={`Status: ${payment.status ?? "Unknown"}`}
              >
                {payment.status ?? "Unknown"}
              </span>

              {payment.contact && (
                <GlassPanel variant="subtle" radius="md" className="p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>Contact</p>
                  <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>{payment.contact.name ?? "Unknown"}</p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>ID: {payment.contact.contact_id}</p>
                </GlassPanel>
              )}

              <GlassPanel variant="subtle" radius="md" className="p-4 space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>Financial Summary</p>
                <DetailRow label="Total" value={formatAmount(payment.total, payment.currency_code)} />
                <DetailRow label="Sub-total" value={formatAmount(payment.sub_total, payment.currency_code)} />
                <DetailRow label="Tax" value={formatAmount(payment.total_tax, payment.currency_code)} />
                {payment.currency_rate != null && <DetailRow label="Currency Rate" value={String(payment.currency_rate)} />}
              </GlassPanel>

              <GlassPanel variant="subtle" radius="md" className="p-4 space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>Details</p>
                <DetailRow label="Type" value={payment.type ?? "—"} />
                <DetailRow label="Date" value={formatDate(payment.date)} />
                <DetailRow label="Created" value={formatDate(payment.created_at)} />
                <DetailRow label="Updated" value={formatDate(payment.updated_at)} />
                {payment.line_amount_types && <DetailRow label="Line Amount Type" value={payment.line_amount_types} />}
                <DetailRow label="Attachments" value={payment.has_attachments ? "Yes" : "No"} />
                <DetailRow label="Reconciled" value={payment.is_reconciled ? "Yes" : "No"} />
              </GlassPanel>

              {lineItems.length > 0 && (
                <GlassPanel variant="subtle" radius="md" className="p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>Line Items</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                          <th className="text-left py-1 pr-2">Code</th>
                          <th className="text-left py-1 pr-2">Description</th>
                          <th className="text-right py-1 pr-2">Qty</th>
                          <th className="text-right py-1 pr-2">Unit</th>
                          <th className="text-right py-1">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lineItems.map((li) => (
                          <tr key={li.line_item_id} className="border-t" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                            <td className="py-1.5 pr-2 font-mono text-xs" style={{ color: "var(--muted)" }}>{li.account_code ?? "—"}</td>
                            <td className="py-1.5 pr-2" style={{ color: "var(--ink)" }}>{li.description ?? "—"}</td>
                            <td className="py-1.5 pr-2 text-right" style={{ color: "var(--ink)" }}>{li.quantity ?? "—"}</td>
                            <td className="py-1.5 pr-2 text-right" style={{ color: "var(--ink)" }}>{li.unit_amount != null ? formatAmount(li.unit_amount) : "—"}</td>
                            <td className="py-1.5 text-right font-medium" style={{ color: "var(--ink)" }}>{li.line_amount != null ? formatAmount(li.line_amount) : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassPanel>
              )}

              <div className="flex justify-end pt-2">
                <button onClick={onClose} className="h-10 rounded-lg px-4 text-sm font-semibold" style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--muted)" }}>
                  Close
                </button>
              </div>
            </div>
          )}
        </GlassPanel>
      </div>
    </>
  );
}
