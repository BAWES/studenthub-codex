"use client";

import { useEffect, useRef, useState } from "react";
import { FadeInSection } from "@/components/marketing";

interface CounterProps {
  end: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}

function AnimatedCounter({ end, suffix = "", prefix = "", decimals = 0 }: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const duration = 2200;
          const steps = 60;
          const increment = end / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(current);
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{count.toFixed(decimals)}{suffix}
    </span>
  );
}

const stats = [
  {
    end: 1200,
    suffix: "+",
    label: "Students placed",
    desc: "Successfully matched with employers across Kuwait",
    accent: "var(--sh-coral)",
    gradient: "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--sh-coral) 12%, transparent), transparent 70%)",
  },
  {
    end: 48,
    suffix: "h",
    prefix: "<",
    label: "Avg time to match",
    desc: "From profile creation to interview",
    accent: "#2563eb",
    gradient: "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, #2563eb 10%, transparent), transparent 70%)",
  },
  {
    end: 500,
    suffix: "+",
    label: "Active employers",
    desc: "Trusted by companies across every sector in Kuwait",
    accent: "var(--success)",
    gradient: "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--success) 10%, transparent), transparent 70%)",
  },
];

export default function StatsCounters() {
  return (
    <section className="py-12 sm:py-16 px-6 max-w-6xl mx-auto max-sm:px-4" aria-label="Platform statistics">
      <FadeInSection asDiv>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="relative overflow-hidden rounded-xl p-6 sm:p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{
                backgroundColor: "color-mix(in srgb, var(--surface) 50%, transparent)",
                border: "1px solid var(--border)",
              }}
            >
              {/* Gradient background accent */}
              <div
                className="absolute inset-0 pointer-events-none opacity-40"
                aria-hidden="true"
                style={{ background: stat.gradient }}
              />

              {/* Accent top bar */}
              <div
                className="absolute top-0 left-4 right-4 h-0.5 rounded-full"
                style={{ backgroundColor: stat.accent }}
                aria-hidden="true"
              />

              <div className="relative z-[1]">
                <span
                  className="block text-[clamp(36px,4.5vw,52px)] font-bold leading-none mb-1.5"
                  style={{ color: stat.accent }}
                >
                  <AnimatedCounter end={stat.end} suffix={stat.suffix} prefix={stat.prefix || ""} />
                </span>
                <span className="block text-sm font-semibold mb-0.5" style={{ color: "var(--ink)" }}>
                  {stat.label}
                </span>
                <span className="block text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                  {stat.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </FadeInSection>
    </section>
  );
}
