import * as React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";

type TrendDirection = "up" | "down" | "flat";

export interface MetricCardProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Card label */
  label: string;
  /** Main value to display */
  value: string | number;
  /** Optional subtitle below value (new API — replaces `note`) */
  subtitle?: string;
  /** Trend direction (shows arrow) */
  trend?: TrendDirection;
  /** Trend label text (e.g. "+12% vs last week") */
  trendLabel?: string;
  /** Optional sparkline data points (0-1 range). New API — replaces `sparklineData` */
  sparkline?: number[];
  /** Icon to show in top-left */
  icon?: LucideIcon;
  /** Glow variant (new API — replaces `accent` for glow toggle) */
  glow?: boolean;
  /** ── Legacy API (backward compat) ── */
  /** Legacy: shown as subtitle */
  note?: string;
  /** Legacy: color accent (info, success, warning, error) */
  accent?: "info" | "success" | "warning" | "error" | "neutral" | "primary";
  /** Legacy: sparkline data as raw numbers */
  sparklineData?: number[];
  /** Legacy: entrance animation delay in ms */
  entranceDelay?: number;
}

const trendIcons: Record<TrendDirection, LucideIcon> = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
};

const trendColors: Record<TrendDirection, string> = {
  up: "var(--sh-success)",
  down: "var(--sh-error)",
  flat: "var(--muted)",
};

const accentColors: Record<string, { dot: string; glow: string; bg: string }> = {
  info: { dot: "var(--sh-info)", glow: "var(--sh-info-glow)", bg: "var(--sh-info-bg)" },
  success: { dot: "var(--sh-success)", glow: "var(--sh-success-glow)", bg: "var(--sh-success-bg)" },
  warning: { dot: "var(--sh-warning)", glow: "var(--sh-warning-glow)", bg: "var(--sh-warning-bg)" },
  error: { dot: "var(--sh-error)", glow: "var(--sh-error-glow)", bg: "var(--sh-error-bg)" },
  primary: { dot: "var(--sh-info)", glow: "var(--sh-info-glow)", bg: "var(--sh-info-bg)" },
  neutral: { dot: "var(--muted)", glow: "transparent", bg: "transparent" },
};

function formatValue(v: string | number): string {
  return typeof v === "number" ? v.toLocaleString() : v;
}

function normalizeSparkline(data?: number[]): number[] | undefined {
  if (!data || data.length < 2) return data;
  const max = Math.max(...data);
  if (max === 0) return data.map(() => 0);
  return data.map((v) => v / max);
}

/**
 * MetricCard — glass panel with label, value, optional sparkline, and trend indicator.
 * Use in dashboards to replace generic shadcn stat cards.
 * Supports both new API (subtitle, sparkline, icon, glow) and legacy API (note, sparklineData, accent, entranceDelay).
 */
const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(function MetricCard(
  {
    className,
    label,
    value,
    subtitle,
    trend = "flat",
    trendLabel,
    sparkline,
    icon: Icon,
    glow = false,
    note,
    accent,
    sparklineData,
    entranceDelay,
    style,
    ...props
  },
  ref,
) {
  // Resolve props: new API takes priority, fall back to legacy
  const resolvedSubtitle = subtitle ?? note;
  const resolvedSparkline = sparkline ?? normalizeSparkline(sparklineData);
  const resolvedGlow = glow || (accent && accent !== "neutral");
  const resolvedAccent = accentColors[accent ?? "info"];

  const TrendIcon = trendIcons[trend];
  const trendColor = trendColors[trend];

  return (
    <div
      ref={ref}
      className={cn("rounded-lg border border-[var(--border)] bg-card p-4 grid content-start gap-2", className)}
      style={{
        ...(entranceDelay !== undefined ? { animationDelay: `${entranceDelay}ms` } : {}),
        ...style,
      }}
      {...props}
    >
      {/* Header row: label */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {Icon && (
          <Icon className="size-4 shrink-0 text-[var(--sh-info)]" aria-hidden="true" />
        )}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2">
        <span className="text-[28px] font-bold leading-none tracking-[-0.02em] text-foreground">
          {formatValue(value)}
        </span>
        {resolvedSubtitle && (
          <span className="text-xs text-muted-foreground">
            {resolvedSubtitle}
          </span>
        )}
      </div>

      {/* Trend row */}
      {(trend !== "flat" || trendLabel) && (
        <div className="flex items-center gap-1.5 mt-1">
          <TrendIcon className="size-3.5 shrink-0" style={{ color: trendColor }} />
          {trendLabel && (
            <span className="text-[11px] font-semibold" style={{ color: trendColor }}>
              {trendLabel}
            </span>
          )}
        </div>
      )}

      {/* Sparkline (inline SVG bar chart) */}
      {resolvedSparkline && resolvedSparkline.length > 1 && (
        <div className="mt-2 h-[32px] flex items-end gap-[2px]" aria-label="Trend sparkline">
          {resolvedSparkline.map((point, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-[2px] transition-all duration-200"
              style={{
                height: `${Math.max(point * 100, 8)}%`,
                background: `color-mix(in srgb, var(--sh-info) ${Math.round(point * 60 + 20)}%, transparent)`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export { MetricCard };
