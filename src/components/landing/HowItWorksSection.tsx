"use client";

import { useEffect, useRef, useState } from "react";
import { UserPlus, Sparkles, Briefcase, Building2, Search, ClipboardCheck } from "lucide-react";

// ── Scroll-reveal hook ──

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function StepCard({
  icon: Icon,
  title,
  description,
  color,
  gradient,
  stepNum,
  delay,
}: {
  icon: typeof UserPlus;
  title: string;
  description: string;
  color: string;
  gradient: string;
  stepNum: number;
  delay: number;
}) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className="relative"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 500ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 500ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      <div
        className="relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
        style={{
          backgroundColor: "color-mix(in srgb, var(--surface) 50%, transparent)",
          border: "1px solid var(--border)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{ background: gradient }}
        />
        <div className="relative z-[1]">
          <div className="flex items-center gap-3 mb-4">
            {/* Step icon */}
            <span
              className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300"
              style={{
                backgroundColor: "color-mix(in srgb, var(--surface) 80%, transparent)",
                border: "1px solid var(--border)",
                color,
              }}
            >
              <Icon className="size-5" />
            </span>
            {/* Step number badge */}
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ml-auto"
              style={{
                backgroundColor: color,
                color: "white",
              }}
            >
              {stepNum}
            </span>
          </div>
          <h3 className="text-base font-semibold mb-1.5" style={{ color: "var(--ink)" }}>
            {title}
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

const candidateSteps = [
  {
    icon: UserPlus,
    title: "Create your profile",
    description:
      "Sign up in under 3 minutes. Add your skills, experience, and preferences. No CV upload required — just fill in what matters.",
    color: "var(--sh-coral)",
    gradient:
      "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--sh-coral) 10%, transparent), transparent 70%)",
  },
  {
    icon: Sparkles,
    title: "Get AI-matched",
    description:
      "Our matching engine finds roles that fit your profile. Employers discover you through smart filters and staff-curated recommendations.",
    color: "#2563eb",
    gradient:
      "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, #2563eb 10%, transparent), transparent 70%)",
  },
  {
    icon: Briefcase,
    title: "Get hired",
    description:
      "Apply with one click. Track your applications, manage timesheets, and receive payments — all from your StudentHub dashboard.",
    color: "var(--success)",
    gradient:
      "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--success) 10%, transparent), transparent 70%)",
  },
];

const employerSteps = [
  {
    icon: Building2,
    title: "Set up your account",
    description:
      "Create your company profile in minutes. Post openings and our staff recruiters start matching you with vetted candidates.",
    color: "var(--sh-coral)",
    gradient:
      "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--sh-coral) 10%, transparent), transparent 70%)",
  },
  {
    icon: Search,
    title: "Discover candidates",
    description:
      "Our AI matching engine and recruitment team work together to find the best-fit candidates for your roles.",
    color: "#2563eb",
    gradient:
      "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, #2563eb 10%, transparent), transparent 70%)",
  },
  {
    icon: ClipboardCheck,
    title: "Hire and manage",
    description:
      "Review candidates, manage timesheets, approve transfers, and track compliance — all in one dashboard.",
    color: "var(--success)",
    gradient:
      "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--success) 10%, transparent), transparent 70%)",
  },
];

export interface HowItWorksSectionProps {
  forEmployer?: boolean;
}

export default function HowItWorksSection({ forEmployer = false }: HowItWorksSectionProps) {
  const steps = forEmployer ? employerSteps : candidateSteps;
  const title = forEmployer
    ? "From posting to placement in three steps."
    : "From profile to placement in three steps.";
  const body = forEmployer
    ? "Post openings, review AI-matched candidates, and manage your team — all on one platform."
    : "Create a profile that works for you. Our system handles the rest.";

  return (
    <section
      id="how-it-works"
      className="py-12 sm:py-16 px-6 max-w-6xl mx-auto max-sm:px-4"
      aria-label="How it works"
    >
      {/* Header */}
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

      {/* Steps grid with connecting line */}
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Desktop connector line */}
        <div
          className="hidden md:block absolute top-[52px] left-[calc(16.66%+24px)] right-[calc(16.66%+24px)] h-px"
          style={{
            background: `linear-gradient(90deg, 
              color-mix(in srgb, var(--sh-coral) 10%, transparent) 0%, 
              var(--sh-coral) 15%, 
              var(--sh-coral) 35%, 
              color-mix(in srgb, var(--sh-coral) 10%, transparent) 50%,
              color-mix(in srgb, #2563eb 10%, transparent) 50%,
              #2563eb 65%,
              #2563eb 85%,
              color-mix(in srgb, var(--success) 10%, transparent) 100%
            )`,
            opacity: 0.3,
          }}
          aria-hidden="true"
        />

        {steps.map((step, i) => (
          <StepCard
            key={step.title}
            icon={step.icon}
            title={step.title}
            description={step.description}
            color={step.color}
            gradient={step.gradient}
            stepNum={i + 1}
            delay={i * 120}
          />
        ))}
      </div>
    </section>
  );
}
