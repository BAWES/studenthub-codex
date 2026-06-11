"use client";

import {
  Search,
  Shield,
  FileText,
  BarChart3,
  Clock,
  CreditCard,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ── Feature definitions ───────────────────────────────────────

interface EmployerFeature {
  icon: LucideIcon;
  title: string;
  body: string;
  stat?: string;
}

const features: EmployerFeature[] = [
  {
    icon: Search,
    title: "AI-matched candidates",
    body: "Get matched candidates within 48 hours of posting. Our algorithm learns your preferences and delivers better results over time.",
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
    body: "Manage hiring across all your locations from one dashboard. Each branch gets its own view, you get the full picture.",
    stat: "Unlimited branches",
  },
];

// ── Props ──────────────────────────────────────────────────────

export interface EmployerSectionProps {
  className?: string;
}

// ── Component ──────────────────────────────────────────────────

export default function EmployerSection({ className }: EmployerSectionProps) {
  return (
    <section className={`shSection ${className ?? ""}`} aria-label="For employers">
      <div className="text-center mb-8 md:mb-10">
        <p className="text-[var(--sh-info)] text-[11px] font-black uppercase tracking-wider mb-2">
          For employers
        </p>
        <h2 className="shBenefitsTitle text-center">
          Hire student talent without the runaround.
        </h2>
        <p
          className="max-w-[520px] mx-auto mt-2 leading-relaxed"
          style={{ color: "var(--muted)" }}
        >
          From posting a role to paying your staff — one system replaces five
          tools. No spreadsheets, no agency fees, no middlemen.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {features.map((feat, i) => {
          const Icon = feat.icon;
          return (
            <div
              key={feat.title}
              className="group shCard rounded-xl p-5 shCardGlow transition-all duration-[280ms] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(16,24,40,0.1)]"
              style={{
                background: "var(--sh-glass-bg)",
                border: "1px solid var(--sh-glass-border)",
                animation: `shCardIn 500ms cubic-bezier(0.16, 1, 0.3, 1) both`,
                animationDelay: `${i * 80}ms`,
              }}
            >
              {/* Icon with glow */}
              <div
                className="size-10 rounded-lg flex items-center justify-center mb-4 transition-colors duration-200"
                style={{
                  background: "var(--sh-info-bg)",
                  color: "var(--sh-info)",
                }}
              >
                <Icon className="size-5" aria-hidden="true" />
              </div>

              <strong className="block text-sm mb-1.5" style={{ color: "var(--ink)" }}>
                {feat.title}
              </strong>
              <p className="text-xs leading-relaxed m-0" style={{ color: "var(--muted)" }}>
                {feat.body}
              </p>

              {feat.stat && (
                <div
                  className="mt-3 pt-3 text-[11px] font-semibold"
                  style={{
                    color: "var(--sh-info)",
                    borderTop: "1px solid var(--sh-glass-border)",
                  }}
                >
                  {feat.stat}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Employer CTA */}
      <div className="text-center mt-8">
        <a
          href="/signup?role=company"
          className="uiButton uiButton_default uiButton_lg shGlowButton"
        >
          Start hiring today
        </a>
      </div>
    </section>
  );
}
