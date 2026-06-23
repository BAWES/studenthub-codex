"use server";

// ---------------------------------------------------------------------------
// Admin Dashboard — server actions
// ---------------------------------------------------------------------------
// Provides the main admin dashboard data: aggregate metrics, request status
// breakdown, and recent items for candidates, companies, requests, and
// transfers.  Ported from src/modules/dashboard/data.ts.
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { dashboardDataSchema, prMergeMetricsResultSchema } from "./schemas";
import type {
  DashboardData,
  DashboardMetric,
  DashboardStatusItem,
  DashboardDataListItem,
  PrMergeMetric,
  PrMergeItem,
} from "./schemas";

// ---------------------------------------------------------------------------
// Formatters (kept local — they're dashboard-specific)
// ---------------------------------------------------------------------------

const moneyFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 3,
  minimumFractionDigits: 0,
});

function formatMoney(value: unknown, currency = "KWD"): string {
  if (value === null || value === undefined) return "0";
  const normalized =
    typeof value === "object" && "toString" in value
      ? value.toString()
      : String(value);
  return `${moneyFormatter.format(Number(normalized))} ${currency}`;
}

function formatDate(value: Date | null | undefined): string {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

function candidateStatus(
  status: number,
  approved: number,
  deleted: number,
): string {
  if (deleted) return "Archived";
  if (approved === 0) return "Needs review";
  if (status === 10) return "Active";
  return `Status ${status}`;
}

function requestStatus(status: string | null | undefined): string {
  if (!status) return "Unspecified";
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

// ---------------------------------------------------------------------------
// getPrMergeMetrics
// ---------------------------------------------------------------------------

/**
 * Query GitHub for recently merged PRs and compute time-to-merge stats.
 *
 * Uses the GitHub Search REST API to find merged PRs in the last 7 days.
 * Computes average and median time-to-merge (createdAt to mergedAt).
 * Falls back gracefully when the API is unreachable or unauthenticated.
 */
export async function getPrMergeMetrics(): Promise<{
  metrics: PrMergeMetric[];
  recent: PrMergeItem[];
}> {
  const token = process.env.GITHUB_TOKEN || "";
  if (!token) {
    return {
      metrics: [
        { label: "Avg time-to-merge", value: "N/A", note: "No GitHub token configured" },
        { label: "Median time-to-merge", value: "N/A", note: "No GitHub token configured" },
        { label: "Last 7d merged PRs", value: "N/A", note: "No GitHub token configured" },
      ],
      recent: [],
    };
  }

  try {
    const url =
      "https://api.github.com/search/issues?" +
      new URLSearchParams({
        q: "repo:BAWES/studenthub-codex type:pr is:merged",
        sort: "updated",
        order: "desc",
        per_page: "50",
      });

    const res = await fetch(url, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
      next: { revalidate: 300 }, // cache for 5 minutes
    });

    if (!res.ok) {
      console.error("[admin/dashboard] GitHub API error:", res.status, res.statusText);
      return {
        metrics: [
          { label: "Avg time-to-merge", value: "Error", note: `HTTP ${res.status}` },
        ],
        recent: [],
      };
    }

    const body = (await res.json()) as { total_count?: number; items?: Array<{
      number: number;
      title: string;
      created_at: string;
      pull_request: { merged_at: string | null };
    }> };

    const items = body.items ?? [];
    if (items.length === 0) {
      return {
        metrics: [{ label: "Avg time-to-merge", value: "N/A", note: "No merged PRs found" }],
        recent: [],
      };
    }

    // Compute hours-to-merge for each PR that has a merged_at
    const prs: Array<{ number: number; title: string; hours: number }> = [];
    for (const item of items) {
      const mergedAt = item.pull_request?.merged_at;
      if (!mergedAt) continue;
      const created = new Date(item.created_at).getTime();
      const merged = new Date(mergedAt).getTime();
      const hours = (merged - created) / 3_600_000;
      prs.push({ number: item.number, title: item.title, hours });
    }

    if (prs.length === 0) {
      return {
        metrics: [{ label: "Avg time-to-merge", value: "N/A", note: "No merges with timestamps" }],
        recent: [],
      };
    }

    // Compute stats
    const totalHours = prs.reduce((sum, p) => sum + p.hours, 0);
    const avgHours = totalHours / prs.length;
    const sorted = [...prs].sort((a, b) => a.hours - b.hours);
    const medianHours = sorted[Math.floor(sorted.length / 2)]?.hours ?? 0;

    const fmt = (h: number): string => {
      if (h < 1) return `${Math.round(h * 60)}m`;
      if (h < 24) return `${h.toFixed(1)}h`;
      const days = Math.round(h / 24);
      return `${days}d ${Math.round(h % 24)}h`;
    };

    // Return recent 5 as a quick-reference list
    const recent = prs.slice(0, 5).map((p) => ({
      number: p.number,
      title: p.title,
      hours: p.hours,
    }));

    // Validate output
    const result = {
      metrics: [
        { label: "Avg time-to-merge", value: fmt(avgHours), note: `Across ${prs.length} PRs` },
        { label: "Median time-to-merge", value: fmt(medianHours), note: "Midpoint of last 50 merged PRs" },
        { label: "Fastest recent", value: fmt(sorted[0]?.hours ?? 0), note: `PR #${sorted[0]?.number ?? "?"}` },
        { label: "Slowest recent", value: fmt(sorted[sorted.length - 1]?.hours ?? 0), note: `PR #${sorted[sorted.length - 1]?.number ?? "?"}` },
        { label: "Merged (7d)", value: `${prs.length}`, note: "PRs in last batch" },
      ],
      recent,
    };
    const parsed = prMergeMetricsResultSchema.safeParse(result);
    if (!parsed.success) {
      console.error("[admin/dashboard] getPrMergeMetrics output validation failed:", parsed.error.format());
    }

    return result;
  } catch (err) {
    console.error("[admin/dashboard] Failed to fetch PR merge metrics:", err);
    return {
      metrics: [
        { label: "Avg time-to-merge", value: "Error", note: "GitHub API request failed" },
      ],
      recent: [],
    };
  }
}

// ---------------------------------------------------------------------------
// getDashboardData
// ---------------------------------------------------------------------------

/**
 * Fetch all data needed for the admin dashboard.
 *
 * Returns aggregate counts, request status breakdown, and the 6 most recent
 * items for each entity type (candidates, companies, requests, transfers).
 *
 * Requires the `admin.system` capability.
 */
export async function getDashboardData(): Promise<DashboardData> {
  await requireCapability("admin.system");

  const [
    candidateCount,
    companyCount,
    requestCount,
    transferCount,
    openCandidateCount,
    activeCompanyCount,
    recentCandidates,
    recentCompanies,
    recentRequests,
    recentTransfers,
    requestStatusGroups,
  ] = await prisma.$transaction([
    prisma.candidate.count({ where: { deleted: 0 } }),
    prisma.company.count({ where: { deleted: 0 } }),
    prisma.request.count(),
    prisma.transfer.count({ where: { deleted: 0 } }),
    prisma.candidate.count({ where: { deleted: 0, approved: 0 } }),
    prisma.company.count({
      where: { deleted: 0, company_approved_to_hire: true },
    }),
    prisma.candidate.findMany({
      where: { deleted: 0 },
      orderBy: { candidate_created_at: "desc" },
      take: 6,
      select: {
        candidate_id: true,
        candidate_name: true,
        candidate_email: true,
        candidate_status: true,
        approved: true,
        deleted: true,
        candidate_created_at: true,
        currency_code: true,
        candidate_hourly_rate: true,
      },
    }),
    prisma.company.findMany({
      where: { deleted: 0 },
      orderBy: { company_created_at: "desc" },
      take: 6,
      select: {
        company_id: true,
        company_name: true,
        company_email: true,
        no_of_active_requests: true,
        company_approved_to_hire: true,
        company_created_at: true,
        currency_code: true,
        company_hourly_rate: true,
      },
    }),
    prisma.request.findMany({
      orderBy: { request_created_datetime: "desc" },
      take: 6,
      select: {
        request_uuid: true,
        request_position_title: true,
        request_status: true,
        request_number_of_employees: true,
        request_created_datetime: true,
        company: { select: { company_name: true } },
      },
    }),
    prisma.transfer.findMany({
      where: { deleted: 0 },
      orderBy: { transfer_created_at: "desc" },
      take: 6,
      select: {
        transfer_id: true,
        total: true,
        company_total: true,
        transfer_status: true,
        start_date: true,
        end_date: true,
        currency_code: true,
        company: { select: { company_name: true } },
      },
    }),
    prisma.request.groupBy({
      by: ["request_status"],
      _count: { _all: true },
      orderBy: { request_status: "asc" },
    }),
  ]);

  // Fetch PR merge metrics in parallel
  const prMetrics = await getPrMergeMetrics();

  const result: DashboardData = {
    metrics: [
      {
        label: "Candidates",
        value: candidateCount,
        note: `${openCandidateCount} need review`,
      },
      {
        label: "Companies",
        value: companyCount,
        note: `${activeCompanyCount} approved to hire`,
      },
      {
        label: "Requests",
        value: requestCount,
        note: "Hiring demand pipeline",
      },
      {
        label: "Transfers",
        value: transferCount,
        note: "Payroll and invoice runs",
      },
    ],
    statusMix: requestStatusGroups
      .map((group) => {
        const count =
          typeof group._count === "object" && group._count
            ? group._count._all ?? 0
            : 0;
        return {
          label: requestStatus(group.request_status),
          value: count,
        } satisfies DashboardStatusItem;
      })
      .sort((a, b) => b.value - a.value),
    recentCandidates: recentCandidates.map(
      (candidate): DashboardDataListItem => ({
        id: candidate.candidate_id,
        title: candidate.candidate_name,
        subtitle: candidate.candidate_email,
        meta: candidateStatus(
          candidate.candidate_status,
          candidate.approved,
          candidate.deleted,
        ),
        amount: formatMoney(
          candidate.candidate_hourly_rate,
          candidate.currency_code ?? "KWD",
        ),
        date: formatDate(candidate.candidate_created_at),
      }),
    ),
    recentCompanies: recentCompanies.map(
      (company): DashboardDataListItem => ({
        id: company.company_id,
        title: company.company_name,
        subtitle: company.company_email ?? "No email",
        meta: company.company_approved_to_hire ? "Approved" : "Not approved",
        amount: formatMoney(
          company.company_hourly_rate,
          company.currency_code ?? "KWD",
        ),
        date: formatDate(company.company_created_at),
        count: company.no_of_active_requests ?? 0,
      }),
    ),
    recentRequests: recentRequests.map(
      (request): DashboardDataListItem => ({
        id: request.request_uuid,
        title: request.request_position_title ?? "Untitled request",
        subtitle: request.company?.company_name ?? "No company",
        meta: requestStatus(request.request_status),
        count: request.request_number_of_employees ?? 0,
        date: formatDate(request.request_created_datetime),
      }),
    ),
    recentTransfers: recentTransfers.map(
      (transfer): DashboardDataListItem => ({
        id: transfer.transfer_id,
        title:
          transfer.company?.company_name ??
          `Transfer #${transfer.transfer_id}`,
        subtitle: `${formatDate(transfer.start_date)} to ${formatDate(transfer.end_date)}`,
        meta: `Status ${transfer.transfer_status}`,
        amount: formatMoney(
          transfer.total ?? transfer.company_total,
          transfer.currency_code ?? "KWD",
        ),
      }),
    ),
    prMergeMetrics: prMetrics.metrics,
    recentPrMergeTimes: prMetrics.recent,
  };

  // Validate the output matches expected shape
  const parsed = dashboardDataSchema.safeParse(result);
  if (!parsed.success) {
    console.error(
      "[admin/dashboard] Schema validation failed:",
      parsed.error.issues,
    );
  }

  return result;
}
