"use client";

import { UserRound, Search, Briefcase, ArrowDown } from "lucide-react";

// ── Step definitions ──────────────────────────────────────────

interface Step {
  icon: typeof UserRound;
  title: string;
  body: string;
  number: number;
}

const steps: Step[] = [
  {
    icon: UserRound,
    number: 1,
    title: "Create your profile",
    body: "Tell us about your skills, experience, and what you're looking for. One profile makes you visible to every employer on the platform — no need to sign up for multiple agencies.",
  },
  {
    icon: Search,
    number: 2,
    title: "Get matched",
    body: "Our AI matches you with relevant openings across employers on the platform. Get alerted the moment a role matches your profile, and apply in one click.",
  },
  {
    icon: Briefcase,
    number: 3,
    title: "Get hired",
    body: "One-click apply, real-time application tracking, and direct communication with employers. From profile to placement — all on one platform.",
  },
];

// ── Props ──────────────────────────────────────────────────────

export interface HowItWorksProps {
  className?: string;
}

// ── Component ──────────────────────────────────────────────────

export default function HowItWorks({ className }: HowItWorksProps) {
  return (
    <section className={`shSection ${className ?? ""}`} aria-label="How it works">
      <div className="text-center mb-8 md:mb-10">
        <p className="text-[var(--sh-info)] text-[11px] font-black uppercase tracking-wider mb-2">
          How it works
        </p>
        <h2 className="shBenefitsTitle text-center">
          From profile to placement in three steps.
        </h2>
        <p
          className="max-w-[520px] mx-auto mt-2 leading-relaxed"
          style={{ color: "var(--muted)" }}
        >
          Whether you&apos;re a student looking for work or an employer hiring talent,
          StudentHub serves both sides of the marketplace seamlessly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[960px] mx-auto">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              className="relative flex flex-col items-center text-center p-6 rounded-xl transition-all duration-[280ms] hover:-translate-y-1"
              style={{
                background: "var(--sh-glass-bg)",
                border: "1px solid var(--sh-glass-border)",
              }}
            >
              {/* Step number badge */}
              <div
                className="size-10 rounded-full flex items-center justify-center text-sm font-black mb-4"
                style={{
                  background: "var(--sh-info-bg)",
                  color: "var(--sh-info)",
                }}
              >
                {step.number}
              </div>

              {/* Arrow connector (desktop only) */}
              {i < steps.length - 1 && (
                <div
                  className="hidden md:block absolute top-5 -right-4 z-10"
                  aria-hidden="true"
                >
                  <ArrowDown className="size-6 -rotate-90" style={{ color: "var(--muted)" }} />
                </div>
              )}

              {/* Icon */}
              <div
                className="size-12 rounded-xl flex items-center justify-center mb-4"
                style={{
                  background: "var(--sh-glass-bg-strong)",
                  color: "var(--sh-info)",
                }}
              >
                <Icon className="size-6" aria-hidden="true" />
              </div>

              <strong
                className="block text-base mb-2"
                style={{ color: "var(--ink)" }}
              >
                {step.title}
              </strong>
              <p
                className="text-xs leading-relaxed m-0 max-w-[280px]"
                style={{ color: "var(--muted)" }}
              >
                {step.body}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
