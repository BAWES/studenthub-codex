"use client";

import { FadeInSection } from "@/components/marketing";
import { UserPlus, Sparkles, Briefcase, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Create your profile",
    description: "Sign up in under 3 minutes. Add your skills, experience, and preferences. No CV upload required — just fill in what matters.",
    color: "var(--sh-coral)",
    gradient: "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--sh-coral) 10%, transparent), transparent 70%)",
  },
  {
    icon: Sparkles,
    title: "Get AI-matched",
    description: "Our matching engine finds roles that fit your profile. Employers discover you through smart filters and recommendations.",
    color: "#2563eb",
    gradient: "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, #2563eb 10%, transparent), transparent 70%)",
  },
  {
    icon: Briefcase,
    title: "Get hired",
    description: "Apply with one click. Track your applications, manage timesheets, and receive payments — all from your StudentHub dashboard.",
    color: "var(--success)",
    gradient: "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--success) 10%, transparent), transparent 70%)",
  },
];

export interface HowItWorksSectionProps {
  forEmployer?: boolean;
}

export default function HowItWorksSection({ forEmployer = false }: HowItWorksSectionProps) {
  const title = forEmployer
    ? "From posting to placement in three steps."
    : "From profile to placement in three steps.";
  const body = forEmployer
    ? "Post openings, review AI-matched candidates, and manage your team — all on one platform."
    : "Create a profile that works for you. Our system handles the rest.";

  return (
    <section id="how-it-works" className="py-12 sm:py-16 px-6 max-w-6xl mx-auto max-sm:px-4" aria-label="How it works">
      <FadeInSection asDiv>
        <div className="text-center mb-10 sm:mb-12">
          <span
            className="inline-block text-[11px] font-bold uppercase tracking-wider mb-2 px-3 py-1 rounded-full"
            style={{
              color: "var(--sh-coral)",
              backgroundColor: "color-mix(in srgb, var(--sh-coral) 10%, transparent)",
              border: "1px solid color-mix(in srgb, var(--sh-coral) 20%, transparent)",
            }}
          >
            How it works
          </span>
          <h2
            className="text-[clamp(22px,3vw,32px)] font-bold leading-tight mb-2"
            style={{ color: "var(--ink)" }}
          >
            {title}
          </h2>
          <p className="text-sm max-w-lg mx-auto" style={{ color: "var(--muted)" }}>
            {body}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:-translate-y-1"
              style={{
                backgroundColor: "color-mix(in srgb, var(--surface) 50%, transparent)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                aria-hidden="true"
                style={{ background: step.gradient }}
              />
              <div className="relative z-[1]">
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--surface) 80%, transparent)",
                      border: "1px solid var(--border)",
                      color: step.color,
                    }}
                  >
                    <step.icon className="size-5" />
                  </span>
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--surface) 80%, transparent)",
                      border: "1px solid var(--border)",
                      color: "var(--muted)",
                    }}
                  >
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-base font-semibold mb-1.5" style={{ color: "var(--ink)" }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </FadeInSection>
    </section>
  );
}
