"use client";

import { MetricCard } from "@/components/ui/metric-card";
import {
  Building2, FileCheck, Users, UserCheck, AlertTriangle,
} from "lucide-react";
import type { ComplianceSummary } from "../schemas";

/**
 * ComplianceSummaryRow — 5 metric cards showing top-level compliance stats.
 * Part of the Admin Compliance Hub (OS Glass).
 */
export function ComplianceSummaryRow({
  summary,
}: {
  summary: ComplianceSummary;
}) {
  return (
    <section
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6"
      aria-label="Compliance summary metrics"
    >
      <MetricCard
        label="Total Companies"
        value={summary.totalCompanies}
        icon={Building2}
        accent="primary"
        glow
      />
      <MetricCard
        label="Unapproved"
        value={summary.unapprovedCompanies}
        icon={AlertTriangle}
        accent="warning"
        glow
        subtitle={summary.totalCompanies > 0
          ? `${Math.round((summary.unapprovedCompanies / summary.totalCompanies) * 100)}%`
          : "—"}
      />
      <MetricCard
        label="Pending ID Requests"
        value={summary.pendingIdRequests}
        icon={FileCheck}
        accent="warning"
        glow
      />
      <MetricCard
        label="Unapproved Candidates"
        value={summary.unapprovedCandidates}
        icon={Users}
        accent="error"
        glow
      />
      <MetricCard
        label="Incomplete Profiles"
        value={summary.incompleteCandidates}
        icon={UserCheck}
        accent="info"
        glow
      />
    </section>
  );
}
