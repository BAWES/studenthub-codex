"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Search,
  Shield,
  FileText,
  BarChart3,
  Clock,
  CreditCard,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const SH_BLUE = "#0b63ce";
const SH_AMBER = "#f59e0b";

// ── Feature definitions ───────────────────────────────────────

interface EmployerFeature {
  icon: LucideIcon;
  title: string;
  body: string;
  stat: string;
}

const features: EmployerFeature[] = [
  {
    icon: Search,
    title: "Staff-matched candidates",
    body: "Get matched candidates within 48 hours of posting. Our staff recruiters learn your preferences and deliver better results over time.",
    stat: "48h avg time-to-match",
  },
  {
    icon: Shield,
    title: "Vetted talent pool",
    body: "Every candidate has a verified profile — right-to-work documents, certifications, and references pre-checked before they reach you.",
    stat: "Pre-verified profiles",
  },
  {
    icon: Clock,
    title: "Timesheet approvals",
    body: "Review and approve timesheets in bulk or individually. No more chasing paper across multiple branches.",
    stat: "10h saved per week",
  },
  {
    icon: FileText,
    title: "Consolidated invoicing",
    body: "One consolidated invoice per branch. Automated VAT calculations and direct payment processing.",
    stat: "3-day month-end close",
  },
  {
    icon: BarChart3,
    title: "Hiring analytics",
    body: "See time-to-hire, cost-per-hire, and candidate source performance. Data-driven hiring decisions.",
    stat: "Real-time dashboard",
  },
  {
    icon: CreditCard,
    title: "Multi-branch management",
    body: "Manage hiring across all locations from one dashboard. Each branch gets its own view, you get the full picture.",
    stat: "Unlimited branches",
  },
];

// ── Props ──────────────────────────────────────────────────────

export interface EmployerSectionProps {
  className?: string;
}

// ── Component ──────────────────────────────────────────────────

export default function EmployerSection({ className }: EmployerSectionProps) {
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
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={cn("scroll-mt-20", className)}
      aria-label="For employers"
    >
      <div className="text-center mb-8 md:mb-10">
        <span
          className="inline-block text-[11px] font-bold uppercase tracking-wider mb-3 px-3 py-1 rounded-full"
          style={{
            color: SH_AMBER,
            backgroundColor: `${SH_AMBER}12`,
          }}
        >
          For employers
        </span>
        <h2
          className="text-[clamp(24px,3vw,36px)] font-bold leading-tight"
          style={{ color: "var(--ink)" }}
        >
          Hire student talent without the runaround.
        </h2>
        <p
          className="max-w-[520px] mx-auto mt-2 text-sm leading-relaxed"
          style={{ color: "var(--muted)" }}
        >
          From posting a role to paying your staff — one system replaces five
          tools. No spreadsheets, no agency fees, no middlemen.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {features.map((feat, i) => {
          const Icon = feat.icon;
          const isVisible = visible;

          return (
            <div
              key={feat.title}
              className="group rounded-xl p-5 transition-all duration-[280ms] hover:-translate-y-1"
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                opacity: isVisible ? 1 : 0,
                transform: isVisible
                  ? "translateY(0)"
                  : "translateY(12px)",
                transition: `opacity 400ms ease, transform 400ms cubic-bezier(0.16, 1, 0.3, 1)`,
                transitionDelay: `${i * 80}ms`,
              }}
            >
              {/* Icon */}
              <div
                className="size-10 rounded-lg flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{
                  backgroundColor: `${SH_BLUE}10`,
                  color: SH_BLUE,
                }}
              >
                <Icon className="size-5" aria-hidden="true" />
              </div>

              <strong
                className="block text-sm mb-1.5"
                style={{ color: "var(--ink)" }}
              >
                {feat.title}
              </strong>
              <p
                className="text-xs leading-relaxed m-0"
                style={{ color: "var(--muted)" }}
              >
                {feat.body}
              </p>

              {/* Stat */}
              <div
                className="mt-3 pt-3 text-[11px] font-semibold flex items-center gap-1.5"
                style={{
                  color: SH_BLUE,
                  borderTop: "1px solid var(--border)",
                }}
              >
                <Sparkles className="size-3" />
                {feat.stat}
              </div>
            </div>
          );
        })}
      </div>

      {/* Employer CTA */}
      <div className="text-center mt-8">
        <a
          href="/signup?role=company"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0"
          style={{
            backgroundColor: SH_AMBER,
            boxShadow: `0 4px 14px ${SH_AMBER}40`,
          }}
        >
          Start hiring today
        </a>
      </div>
    </section>
  );
}
