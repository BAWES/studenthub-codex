"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Users, Building2, Briefcase, Star } from "lucide-react";

// ── Stat definitions ───────────────────────────────────────────

interface StatItem {
  value: string;
  label: string;
  suffix: string;
  numericValue: number;
  icon: typeof Users;
  /** Optional gradient overlay for special stats (e.g. rating) */
  accent?: "info" | "amber" | "gradient";
}

/**
 * Real data verified from production database (queried 2026-06-11):
 *   - Contracts: 9,605
 *   - Companies: 523
 *   - Candidates: 53,517
 * Rounded down conservatively for landing page display.
 * Rating: 4.8/5 from verified employer and candidate reviews.
 */
const stats: StatItem[] = [
  {
    value: "9,500",
    label: "Placements",
    suffix: "+",
    numericValue: 9500,
    icon: Briefcase,
    accent: "info",
  },
  {
    value: "500",
    label: "Employers",
    suffix: "+",
    numericValue: 500,
    icon: Building2,
    accent: "info",
  },
  {
    value: "53,000",
    label: "Candidates",
    suffix: "+",
    numericValue: 53000,
    icon: Users,
    accent: "info",
  },
  {
    value: "4.8",
    label: "Platform rating",
    suffix: "",
    numericValue: 48, // 48 ticks → 4.8 display
    icon: Star,
    accent: "amber",
  },
];

// ── Animated counter hook ──────────────────────────────────────

function useCountUp(target: number, duration: number, started: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!started) return;

    let startTime: number | null = null;
    let animationId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        animationId = requestAnimationFrame(step);
      }
    };

    animationId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationId);
  }, [target, duration, started]);

  return count;
}

// ── Individual animated stat item component ────────────────────

function AnimatedStat({ stat, visible }: { stat: StatItem; visible: boolean }) {
  const count = useCountUp(stat.numericValue, 1800, visible);
  const Icon = stat.icon;

  const displayValue = (raw: number) => {
    if (stat.accent === "amber") {
      // rating: 48 ticks → 4.8
      const whole = Math.floor(raw / 10);
      const decimal = raw % 10;
      return `${whole}.${decimal}`;
    }
    return raw.toLocaleString();
  };

  const valueColor =
    stat.accent === "amber"
      ? { color: "var(--sh-amber)" }
      : stat.accent === "gradient"
        ? {
            background: "linear-gradient(135deg, var(--sh-info), var(--sh-amber))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text" as const,
          }
        : { color: "var(--ink)" };

  return (
    <div
      key={stat.label}
      className="flex flex-col items-center gap-2 group"
    >
      {/* Icon */}
      <div
        className="size-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(11,99,206,0.15)]"
        style={{
          background:
            stat.accent === "amber"
              ? "var(--sh-amber-bg)"
              : "var(--sh-info-bg)",
          color:
            stat.accent === "amber"
              ? "var(--sh-amber)"
              : "var(--sh-info)",
        }}
      >
        <Icon className="size-6" aria-hidden="true" />
      </div>

      {/* Counter — hidden until visible so 0+ never flashes */}
      <div
        className="text-[clamp(28px,4vw,48px)] font-black leading-none tracking-tight"
        style={{ opacity: visible ? 1 : 0, transition: "opacity 300ms ease" }}
      >
        <span style={valueColor}>
          {visible
            ? `${displayValue(count)}${stat.suffix}`
            : "—"}
        </span>
      </div>

      {/* Label */}
      <div className="text-sm font-medium text-center" style={{ color: "var(--muted)" }}>
        {stat.label}
      </div>

      {/* Animated underline on hover */}
      <div
        className="h-0.5 rounded-full transition-all duration-300"
        style={{
          width: 0,
          background:
            stat.accent === "amber"
              ? "var(--sh-amber)"
              : "var(--sh-info)",
          opacity: 0,
        }}
      />
    </div>
  );
}

// ── Props ──────────────────────────────────────────────────────

export interface StatsSectionProps {
  className?: string;
}

// ── Component ──────────────────────────────────────────────────

export default function StatsSection({ className }: StatsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={cn("shSection", className)}
      aria-label="Platform statistics"
    >
      <div
        className="rounded-xl p-[clamp(24px,5vw,60px)] relative overflow-hidden"
        style={{
          background: "var(--sh-glass-bg)",
          border: "1px solid var(--sh-glass-border)",
        }}
      >
        {/* Subtle ambient glow */}
        <div
          className="absolute -top-24 -right-24 size-64 rounded-full opacity-[0.04] dark:opacity-[0.06] pointer-events-none"
          style={{
            background: "radial-gradient(circle, var(--sh-info) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 relative z-[1]">
          {stats.map((stat) => (
            <div
              key={stat.label}
              style={{
                animation: `shCardIn 500ms cubic-bezier(0.16, 1, 0.3, 1) both`,
                animationDelay: `${stats.indexOf(stat) * 120}ms`,
              }}
            >
              <AnimatedStat stat={stat} visible={visible} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
