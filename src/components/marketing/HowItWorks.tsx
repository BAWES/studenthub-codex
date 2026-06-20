"use client";

import { UserRound, Search, Briefcase } from "lucide-react";

// ── Step definitions ──────────────────────────────────────────

const SH_BLUE = "#0b63ce";

interface Step {
  icon: typeof UserRound;
  title: string;
  body: string;
  number: number;
  tag: string;
}

const steps: Step[] = [
  {
    icon: UserRound,
    number: 1,
    title: "Create your profile",
    tag: "3 minutes · No CV needed",
    body: "Tell us about your skills, experience, and preferences. One profile makes you visible to every employer on the platform — no need to sign up for multiple agencies.",
  },
  {
    icon: Search,
    number: 2,
    title: "Get matched",
    tag: "Staff-powered matching",
    body: "Our staff recruiters match you with relevant openings across employers. Get alerted the moment a role fits your profile, and apply in one click.",
  },
  {
    icon: Briefcase,
    number: 3,
    title: "Get hired",
    tag: "Fast placement",
    body: "One-click apply, real-time tracking, and direct communication with employers. Timesheets, payments, and compliance — all on one platform.",
  },
];

// ── Props ──────────────────────────────────────────────────────

export interface HowItWorksProps {
  className?: string;
}

// ── Component ──────────────────────────────────────────────────

export default function HowItWorks({ className }: HowItWorksProps) {
  return (
    <section
      className={`scroll-mt-20 ${className ?? ""}`}
      aria-label="How it works"
    >
      <div className="text-center mb-8 md:mb-10">
        <span className="shLandingEyebrow">How it works</span>
        <div className="shLandingGlowDivider mt-3" />
        <h2 className="shLandingSectionTitle mt-3">
          From profile to placement in three steps.
        </h2>
        <p className="shLandingSectionSub mx-auto mt-2">
          Whether you&apos;re a student looking for work or an employer hiring
          talent, our staff recruiters match candidates to the right roles
          across both sides.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[960px] mx-auto">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              className="relative flex flex-col items-center text-center p-6 rounded-xl shLandingCardHover"
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                animation: `shCardIn 500ms cubic-bezier(0.16, 1, 0.3, 1) both`,
                animationDelay: `${i * 120}ms`,
              }}
            >
              {/* Step number */}
              <div
                className="size-9 rounded-full flex items-center justify-center text-xs font-black mb-4"
                style={{
                  backgroundColor: `${SH_BLUE}12`,
                  color: SH_BLUE,
                }}
              >
                {step.number}
              </div>

              {/* Icon */}
              <div
                className="size-12 rounded-xl flex items-center justify-center mb-3"
                style={{
                  backgroundColor: `${SH_BLUE}08`,
                  color: SH_BLUE,
                }}
              >
                <Icon className="size-6" aria-hidden="true" />
              </div>

              {/* Tag */}
              <span
                className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-3"
                style={{
                  backgroundColor: "var(--secondary)",
                  color: "var(--muted)",
                }}
              >
                {step.tag}
              </span>

              <strong
                className="block text-base mb-2 tracking-tight"
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
