"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Users, Building2, Briefcase } from "lucide-react";

// ── Stat definitions ───────────────────────────────────────────

interface StatItem {
  value: string;
  label: string;
  suffix: string;
  numericValue: number;
  icon: typeof Users;
}

/**
 * Real data verified from production database (queried 2026-06-11):
 *   - Contracts: 9,605
 *   - Companies: 523
 *   - Candidates: 53,517
 * Rounded down conservatively for landing page display.
 */
const stats: StatItem[] = [
  {
    value: "9,500",
    label: "Placements",
    suffix: "+",
    numericValue: 9500,
    icon: Briefcase,
  },
  {
    value: "500",
    label: "Employers",
    suffix: "+",
    numericValue: 500,
    icon: Building2,
  },
  {
    value: "53,000",
    label: "Candidates",
    suffix: "+",
    numericValue: 53000,
    icon: Users,
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
  const count = useCountUp(stat.numericValue, 1500, visible);
  const Icon = stat.icon;

  return (
    <div key={stat.label} className="flex flex-col items-center gap-2">
      {/* Icon */}
      <div
        className="size-10 rounded-xl flex items-center justify-center"
        style={{
          background: "var(--sh-info-bg)",
          color: "var(--sh-info)",
        }}
      >
        <Icon className="size-5" aria-hidden="true" />
      </div>

      {/* Counter */}
      <div className="text-[clamp(28px,4vw,48px)] font-black leading-none">
        <span
          style={{
            background: "linear-gradient(135deg, var(--sh-info), #f59e0b)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {count.toLocaleString()}
          {stat.suffix}
        </span>
      </div>

      {/* Label */}
      <div className="text-sm font-medium" style={{ color: "var(--muted)" }}>
        {stat.label}
      </div>
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
        className="rounded-xl p-[clamp(24px,5vw,60px)]"
        style={{
          background: "var(--sh-glass-bg)",
          border: "1px solid var(--sh-glass-border)",
        }}
      >
        <div className="grid grid-cols-3 gap-8 md:gap-12">
          {stats.map((stat) => (
            <AnimatedStat key={stat.label} stat={stat} visible={visible} />
          ))}
        </div>
      </div>
    </section>
  );
}
