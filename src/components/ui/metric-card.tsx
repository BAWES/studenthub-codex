"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  MetricCard — glass card with value, label, inline SVG sparkline,  */
/*  trend indicator, hover lift, staggered entrance animation.         */
/*  Designed for the StudentHub OS aesthetic — Linear/Arc/Notion.      */
/* ------------------------------------------------------------------ */

export type MetricTrend = "up" | "down" | "flat";

export interface MetricCardProps {
  /** Human-readable label (e.g. "Active Candidates") */
  label: string;
  /** Primary numeric or short-string value */
  value: string | number;
  /** Optional secondary note or context */
  note?: string;
  /** Trend direction — shows an arrow + semantic colour */
  trend?: MetricTrend;
  /** Optional trend change text (e.g. "+12%", "-3") */
  trendLabel?: string;
  /** Small inline sparkline data points (3–12 numbers) */
  sparklineData?: number[];
  /** Accent colour for the sparkline stroke & glow */
  accent?: "primary" | "success" | "warning" | "info";
  /** Optional click handler */
  onClick?: () => void;
  /** Stagger entrance delay offset (ms) — pass index * 60 from parent */
  entranceDelay?: number;
  className?: string;
}

const accentMap: Record<string, { stroke: string; glow: string }> = {
  primary: { stroke: "var(--blue)", glow: "var(--sh-glow-sm)" },
  success: { stroke: "var(--sh-success)", glow: "var(--sh-success-glow)" },
  warning: { stroke: "var(--sh-warning)", glow: "var(--sh-warning-glow)" },
  info: { stroke: "var(--sh-info)", glow: "var(--sh-info-glow)" },
};

function MetricSparkline({ data, accent }: { data: number[]; accent: string }) {
  const { stroke } = accentMap[accent] ?? accentMap.primary;
  const width = 120;
  const height = 32;
  const padding = 4;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * chartW;
    const y = padding + chartH - ((val - min) / range) * chartH;
    return `${x},${y}`;
  });

  const d = points.map((p, i) => (i === 0 ? `M${p}` : `L${p}`)).join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="shMetricSparkline"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`spark-fill-${accent}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.20" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <path
        d={`${d} L${padding + chartW},${padding + chartH} L${padding},${padding + chartH} Z`}
        fill={`url(#spark-fill-${accent})`}
      />
      {/* Stroke line */}
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={points[points.length - 1].split(",")[0]}
        cy={points[points.length - 1].split(",")[1]}
        r="2"
        fill={stroke}
      />
    </svg>
  );
}

function TrendIcon({ trend, accent }: { trend: MetricTrend; accent: string }) {
  const { stroke } = accentMap[accent] ?? accentMap.primary;
  if (trend === "flat") {
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
        <line x1="1" y1="6" x2="11" y2="6" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  const up = trend === "up";
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path
        d={up ? "M6 11V1M6 1l4 4M6 1L2 5" : "M6 1v10M6 11l4-4M6 11l-4-4"}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MetricCard({
  label,
  value,
  note,
  trend,
  trendLabel,
  sparklineData,
  accent = "primary",
  onClick,
  entranceDelay = 0,
  className,
}: MetricCardProps) {
  return (
    <article
      className={cn(
        "shMetricCard",
        onClick && "shMetricCardClickable",
        className,
      )}
      style={{ animationDelay: `${entranceDelay}ms` } as React.CSSProperties}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <div className="shMetricCardBody">
        <div className="shMetricCardTop">
          <span className="shMetricCardLabel">{label}</span>
          {trend && (
            <span className="shMetricCardTrend" data-trend={trend}>
              <TrendIcon trend={trend} accent={accent} />
              {trendLabel && <small>{trendLabel}</small>}
            </span>
          )}
        </div>
        <strong className="shMetricCardValue">
          {typeof value === "number" ? value.toLocaleString("en-US") : value}
        </strong>
        {note && <p className="shMetricCardNote">{note}</p>}
      </div>
      {sparklineData && sparklineData.length >= 2 && (
        <div className="shMetricCardChart">
          <MetricSparkline data={sparklineData} accent={accent} />
        </div>
      )}
    </article>
  );
}

export { MetricCard };
