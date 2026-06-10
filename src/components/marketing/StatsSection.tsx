"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

// ── Stat definitions ───────────────────────────────────────────

interface StatItem {
  value: string;
  label: string;
  suffix: string;
  numericValue: number;
}

const stats: StatItem[] = [
  {
    value: "1,200",
    label: "Students placed",
    suffix: "+",
    numericValue: 1200,
  },
  {
    value: "4.8",
    label: "Star rating",
    suffix: "",
    numericValue: 48,
  },
  {
    value: "60",
    label: "Active employers",
    suffix: "+",
    numericValue: 60,
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
  const isRating = stat.label === "Star rating";
  const displayValue = isRating
    ? `${(count / 10).toFixed(1)}`
    : `${count}${stat.suffix}`;

  return (
    <div key={stat.label}>
      <div className="text-[clamp(28px,4vw,48px)] font-black leading-none mb-1">
        <span
          style={{
            background: "linear-gradient(135deg, var(--sh-info), #f59e0b)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {displayValue}
        </span>
      </div>
      {/* Star rating icon */}
      {isRating && (
        <div className="flex items-center justify-center gap-1 mb-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className="size-4"
              style={{
                color: "#f59e0b",
                fill: count >= star * 10 ? "#f59e0b" : "transparent",
              }}
              aria-hidden="true"
            />
          ))}
        </div>
      )}
      <div className="text-sm" style={{ color: "var(--muted)" }}>
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
        <div className="grid grid-cols-3 gap-8 md:gap-12 text-center">
          {stats.map((stat) => (
            <AnimatedStat key={stat.label} stat={stat} visible={visible} />
          ))}
        </div>
      </div>
    </section>
  );
}
