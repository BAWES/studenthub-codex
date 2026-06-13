"use client";

// ---------------------------------------------------------------------------
// InvoiceMetricCards
// ---------------------------------------------------------------------------
// Glass-styled metric cards showing total, unpaid, and monthly invoice counts.
// ---------------------------------------------------------------------------

export type InvoiceMetricCardsProps = {
  totalInvoices: number;
  unpaidCount: number;
  thisMonthVolume: number;
};

export function InvoiceMetricCards({
  totalInvoices,
  unpaidCount,
  thisMonthVolume,
}: InvoiceMetricCardsProps) {
  const cards = [
    { label: "Total Invoices", value: totalInvoices, note: "All time" },
    { label: "Unpaid", value: unpaidCount, note: `${totalInvoices - unpaidCount} paid` },
    { label: "This Month", value: thisMonthVolume, note: "Invoices issued" },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border p-4 bg-white"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--muted)" }}>
            {card.label}
          </p>
          <p className="text-2xl font-bold" style={{ color: "var(--accent)" }}>
            {card.value.toLocaleString()}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
            {card.note}
          </p>
        </div>
      ))}
    </div>
  );
}
