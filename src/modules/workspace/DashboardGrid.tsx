"use client";

import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";
import { EMPTY_NO_RECENT_ACTIVITY } from "./emptyStates";

// ── Types ──────────────────────────────────────────────────

export type StatCard = {
  /** Label for the stat (e.g. "Active Candidates"). */
  label: string;
  /** Numeric value to display. */
  value: number;
  /** Optional change text (e.g. "+12%", "-3"). */
  change?: string;
  /** Trend direction for coloring. */
  trend?: "up" | "down" | "neutral";
};

export type ActivityItem = {
  id: string;
  text: string;
  time: string;
};

export type DashboardGridProps = {
  /** Stat cards displayed at the top of the dashboard. */
  statCards: StatCard[];
  /** Chart content (custom component wrapped in a card). */
  charts?: ReactNode;
  /** Optional title for the chart section. */
  chartTitle?: string;
  /** Activity feed configuration. */
  activityFeed?: {
    title: string;
    items: ActivityItem[];
  };
  /** Loading state — shows skeleton when true. */
  loading?: boolean;
  /** Optional className override. */
  className?: string;
};

// ── Skeleton ───────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <article className="metric" key={i}>
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-9 w-20 mb-1" />
            <Skeleton className="h-3 w-12" />
          </article>
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}

// ── Component ──────────────────────────────────────────────

export function DashboardGrid({
  statCards,
  charts,
  chartTitle,
  activityFeed,
  loading = false,
  className,
}: DashboardGridProps) {
  if (loading) {
    return <div className={className}><DashboardSkeleton /></div>;
  }

  return (
    <section className={className}>
      {/* Stat cards */}
      {statCards.length > 0 ? (
        <section className="metrics" aria-label="Dashboard metrics">
          {statCards.map((card) => (
            <article className="metric" key={card.label}>
              <span>{card.label}</span>
              <strong>{card.value.toLocaleString("en-US")}</strong>
              {card.change ? (
                <p className={`trend ${card.trend === "up" ? "trendUp" : card.trend === "down" ? "trendDown" : ""}`}>
                  {card.trend === "up" ? (
                    <TrendingUp size={12} aria-hidden="true" />
                  ) : card.trend === "down" ? (
                    <TrendingDown size={12} aria-hidden="true" />
                  ) : null}
                  {card.change}
                </p>
              ) : null}
            </article>
          ))}
        </section>
      ) : null}

      {/* Charts area */}
      {charts ? (
        <Card>
          {chartTitle ? (
            <CardHeader>
              <CardTitle>{chartTitle}</CardTitle>
            </CardHeader>
          ) : null}
          <CardContent>{charts}</CardContent>
        </Card>
      ) : null}

      {/* Activity feed */}
      {activityFeed ? (
        <Card>
          <CardHeader>
            <CardTitle>{activityFeed.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="activityFeed">
              {activityFeed.items.map((item) => (
                <div className="activityItem" key={item.id}>
                  <span className="activityText">{item.text}</span>
                  <span className="activityTime">{item.time}</span>
                </div>
              ))}
              {activityFeed.items.length === 0 ? (
                <p className="emptyState">{EMPTY_NO_RECENT_ACTIVITY}</p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
