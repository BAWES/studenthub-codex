"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TrendDirection = "up" | "down" | "flat";

export type MetricCardProps = {
  /** Metric label (e.g. "Active candidates"). */
  label: string;
  /** Primary value. */
  value: number | string;
  /** Optional subtitle / note shown below the value. */
  note?: string;
  /** Optional trend indicator. */
  trend?: {
    direction: TrendDirection;
    label: string; // e.g. "+12% this week"
  };
  /** Override the trend icon. Defaults to TrendingUp/Down/Minus. */
  trendIcon?: ReactNode;
  /** Icon shown left of the label. */
  icon?: ReactNode;
  /** Delay before entrance animation (ms). Used for staggered lists. */
  delay?: number;
  /** Accent color class for the top border glow. */
  accent?: "info" | "success" | "warning" | "error" | "none";
  /** Optional click handler. */
  onClick?: () => void;
  href?: string;
};

// ---------------------------------------------------------------------------
// Trend icon map
// ---------------------------------------------------------------------------

const TrendIcon: Record<TrendDirection, ReactNode> = {
  up: <TrendingUp size={14} aria-hidden="true" />,
  down: <TrendingDown size={14} aria-hidden="true" />,
  flat: <Minus size={14} aria-hidden="true" />,
};

const accentVar: Record<string, string> = {
  info: "var(--sh-info)",
  success: "var(--sh-success)",
  warning: "var(--sh-warning)",
  error: "var(--sh-error)",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MetricCard({
  label,
  value,
  note,
  trend,
  trendIcon,
  icon,
  delay = 0,
  accent = "info",
  onClick,
  href,
}: MetricCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // Entrance animation via IntersectionObserver
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  const accentColor = accent !== "none" ? accentVar[accent] : undefined;

  const content = (
    <>
      {/* Top accent glow */}
      <span
        className="metricCardAccent"
        aria-hidden="true"
        style={
          accentColor
            ? {
                background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
                opacity: 0.3,
              }
            : undefined
        }
      />

      <div className="metricCardBody">
        {/* Label row */}
        <div className="metricCardLabelRow">
          {icon ? <span className="metricCardIcon">{icon}</span> : null}
          <span className="metricCardLabel">{label}</span>
        </div>

        {/* Value */}
        <strong className="metricCardValue">
          {typeof value === "number" ? value.toLocaleString("en-US") : value}
        </strong>

        {/* Note + Trend */}
        {note || trend ? (
          <div className="metricCardMeta">
            {note ? <p className="metricCardNote">{note}</p> : null}
            {trend ? (
              <span
                className={`metricCardTrend metricCardTrend--${trend.direction}`}
              >
                {trendIcon ?? TrendIcon[trend.direction]}
                {trend.label}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );

  const Tag = href ? "a" : onClick ? "button" : "div";

  return (
    <Tag
      className={`metricCard ${visible ? "metricCard--visible" : "metricCard--hidden"} ${onClick || href ? "metricCard--interactive" : ""}`}
      href={href as any}
      onClick={onClick}
      style={{ "--metric-delay": `${delay}ms` } as React.CSSProperties}
      aria-label={`${label}: ${typeof value === "number" ? value.toLocaleString("en-US") : value}`}
    >
      <div ref={ref}>{content}</div>
    </Tag>
  );
}
