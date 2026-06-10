"use client";

import { MetricCard } from "@/components/ui/metric-card";
import {
  Briefcase,
  FileText,
  Clock,
  Users,
  Store,
  FileEdit,
} from "lucide-react";

type MetricItem = {
  label: string;
  value: number;
  note: string;
};

type CompanyMetricsProps = {
  baseMetrics: MetricItem[];
  activeRequestCount: number;
  pendingRequestCount: number;
  openPositionsCount: number;
};

/**
 * CompanyMetrics — metric cards for the company workspace dashboard.
 * Combines base workspace metrics with extended CompanyHome metrics.
 */
export function CompanyMetrics({
  baseMetrics,
  activeRequestCount,
  pendingRequestCount,
  openPositionsCount,
}: CompanyMetricsProps) {
  const extendedMetrics = [
    {
      label: "Active Requests",
      value: activeRequestCount,
      note: `${pendingRequestCount} pending review`,
      icon: FileText,
    },
    {
      label: "Open Positions",
      value: openPositionsCount,
      note: "Across active requests",
      icon: Briefcase,
    },
    {
      label: "Linked Companies",
      value: baseMetrics[0]?.value ?? 0,
      note: baseMetrics[0]?.note ?? "—",
      icon: Store,
    },
    {
      label: "Total Requests",
      value: baseMetrics[1]?.value ?? 0,
      note: baseMetrics[1]?.note ?? "—",
      icon: FileEdit,
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Company workspace metrics">
      {extendedMetrics.map((metric, i) => (
        <MetricCard
          key={metric.label}
          label={metric.label}
          value={metric.value}
          note={metric.note}
          icon={metric.icon}
          entranceDelay={i * 60}
        />
      ))}
    </section>
  );
}
