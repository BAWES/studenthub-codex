"use client";

import { useCallback } from "react";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

const STATUS_BADGE_VARIANTS_DRAWER: Record<string, "success" | "warning" | "secondary"> = {
  AUTHORISED: "success",
  PAID: "success",
  VOIDED: "warning",
  DELETED: "warning",
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
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export function PaymentDetailDrawer({ payment, lineItems, loading, open, onClose }: PaymentDetailDrawerProps) {
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) onClose();
    },
    [onClose],
  );

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[480px] p-0">
        <div className="h-full overflow-y-auto p-6">
          <SheetHeader className="flex items-start justify-between mb-6">
            <SheetTitle className="text-xl font-bold text-foreground">
              {loading ? "Loading..." : payment?.reference ?? "No Reference"}
            </SheetTitle>
            <SheetClose className="p-2 rounded-lg hover:bg-white/10" aria-label="Close payment detail" />
          </SheetHeader>

          <SheetBody>
            {loading ? (
              <div className="space-y-6" aria-hidden="true">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-6 rounded bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : !payment ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                <span className="text-4xl">🔍</span>
                <p className="text-lg font-semibold text-foreground">Payment not found</p>
                <Button onClick={onClose} variant="default" size="sm">
                  Close
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <Badge
                  variant={STATUS_BADGE_VARIANTS_DRAWER[payment.status ?? ""] ?? "secondary"}
                  aria-label={`Status: ${payment.status ?? "Unknown"}`}
                >
                  {payment.status ?? "Unknown"}
                </Badge>

                {payment.contact && (
                  <div className="rounded-lg border border-border bg-white p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider mb-2 text-muted-foreground">Contact</p>
                    <p className="text-sm font-medium text-foreground">{payment.contact.name ?? "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">ID: {payment.contact.contact_id}</p>
                  </div>
                )}

                <div className="rounded-lg border border-border bg-white p-4 space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-2 text-muted-foreground">Financial Summary</p>
                  <DetailRow label="Total" value={formatAmount(payment.total, payment.currency_code)} />
                  <DetailRow label="Sub-total" value={formatAmount(payment.sub_total, payment.currency_code)} />
                  <DetailRow label="Tax" value={formatAmount(payment.total_tax, payment.currency_code)} />
                  {payment.currency_rate != null && <DetailRow label="Currency Rate" value={String(payment.currency_rate)} />}
                </div>

                <div className="rounded-lg border border-border bg-white p-4 space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-2 text-muted-foreground">Details</p>
                  <DetailRow label="Type" value={payment.type ?? "—"} />
                  <DetailRow label="Date" value={formatDate(payment.date)} />
                  <DetailRow label="Created" value={formatDate(payment.created_at)} />
                  <DetailRow label="Updated" value={formatDate(payment.updated_at)} />
                  {payment.line_amount_types && <DetailRow label="Line Amount Type" value={payment.line_amount_types} />}
                  <DetailRow label="Attachments" value={payment.has_attachments ? "Yes" : "No"} />
                  <DetailRow label="Reconciled" value={payment.is_reconciled ? "Yes" : "No"} />
                </div>

                {lineItems.length > 0 && (
                  <div className="rounded-lg border border-border bg-card p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider mb-2 text-muted-foreground">Line Items</p>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            <TableHead>Code</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">Unit</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {lineItems.map((li) => (
                            <TableRow key={li.line_item_id}>
                              <TableCell className="font-mono text-xs text-muted-foreground">{li.account_code ?? "—"}</TableCell>
                              <TableCell className="text-foreground">{li.description ?? "—"}</TableCell>
                              <TableCell className="text-right text-foreground">{li.quantity ?? "—"}</TableCell>
                              <TableCell className="text-right text-foreground">{li.unit_amount != null ? formatAmount(li.unit_amount) : "—"}</TableCell>
                              <TableCell className="text-right font-medium text-foreground">{li.line_amount != null ? formatAmount(li.line_amount) : "—"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <SheetClose asChild>
                    <Button variant="outline" size="sm">
                      Close
                    </Button>
                  </SheetClose>
                </div>
              </div>
            )}
          </SheetBody>
        </div>
      </SheetContent>
    </Sheet>
  );
}
