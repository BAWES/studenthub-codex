"use client";

import { MetricCard } from "@/components/ui/metric-card";

// ---------------------------------------------------------------------------
// PaymentMetricCards
// ---------------------------------------------------------------------------
// A row of 4 MetricCard components showing key payment metrics derived from
// the listPayments server action.
// ---------------------------------------------------------------------------

export type PaymentMetricCardsProps = {
  totalTransactions: number;
  thisMonthVolume: number;
  unreconciledCount: number;
  avgAmount: number;
};

export function PaymentMetricCards({
  totalTransactions,
  thisMonthVolume,
  unreconciledCount,
  avgAmount,
}: PaymentMetricCardsProps) {
  const metrics = [
    {
      label: "Total Transactions",
      value: totalTransactions,
      subtitle: "All time payments",
      accent: "info" as const,
    },
    {
      label: "This Month",
      value: thisMonthVolume,
      subtitle: `${new Date().toLocaleString("default", { month: "long" })} volume`,
      accent: "success" as const,
    },
    {
      label: "Unreconciled",
      value: unreconciledCount,
      subtitle: "Needs attention",
      accent: "warning" as const,
    },
    {
      label: "Avg Amount",
      value: `${avgAmount.toLocaleString("en-US", { maximumFractionDigits: 3 })} KWD`,
      subtitle: "Per transaction",
      accent: "primary" as const,
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6" aria-label="Payment metrics">
      {metrics.map((metric, i) => (
        <MetricCard
          key={metric.label}
          label={metric.label}
          value={metric.value}
          subtitle={metric.subtitle}
          accent={metric.accent}
          entranceDelay={i * 60}
        />
      ))}
    </section>
  );
}
