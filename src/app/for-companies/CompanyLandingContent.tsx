"use client";

import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";
import { HeroSection } from "@/components/marketing";
import { FeatureGrid } from "@/components/marketing";
import { TestimonialCarousel } from "@/components/marketing";
import { PricingCard } from "@/components/marketing";
import { ComparisonTable } from "@/components/marketing";

// ── Props ─────────────────────────────────────────────────────

export interface CompanyLandingContentProps {
  session: {
    id: string;
    email: string;
    role: string;
    name: string;
  } | null;
}

// ── Company-specific copy ──────────────────────────────────────

const PAIN_POINTS = [
  {
    problem: "Staff sourcing, compliance, and payroll eat your margins",
    solution:
      "StudentHub handles the entire process — sourcing, placement, compliance verification, and payroll. You get pre-vetted student workers on a simple monthly fee or hourly rate. No HR overhead, no recruitment costs.",
  },
  {
    problem: "Workers come and go — you need consistency",
    solution:
      "StudentHub orchestrates 3-month rotations. When one placement ends, the next student is already matched. Continuity without the management headache. Workers wear ID cards with QR codes for instant compliance verification.",
  },
  {
    problem: "Compliance risk is a business risk",
    solution:
      "Every worker's right-to-work documents, certifications, and ID are verified and tracked through our system. Government inspectors can validate on-site via QR code. Audit-ready from day one, zero extra paperwork for your team.",
  },
];

const COMPANY_STATS = [
  { value: "48h", label: "avg time to first candidate match" },
  { value: "200+", label: "companies using StudentHub" },
  { value: "99.7%", label: "compliance audit pass rate" },
  { value: "Zero", label: "HR overhead for your team" },
];

// ── Component ─────────────────────────────────────────────────

export default function CompanyLandingContent({
  session,
}: CompanyLandingContentProps) {
  const isLoggedIn = Boolean(session);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-foreground focus:shadow-lg focus:outline-none"
      >
        Skip to content
      </a>
      <main
        id="main-content"
        className="min-h-svh w-[min(1320px,calc(100%_-_28px))] mx-auto grid content-start gap-6 pt-[18px] pb-[42px] max-sm:w-[min(calc(100%_-_20px),720px)]">
      {/* ── Navigation ── */}
      <nav className="sticky top-[3px] z-20 min-h-[62px] flex items-center justify-between gap-[14px] rounded-xl p-[2px] bg-white shadow-md border border-border" aria-label="StudentHub public navigation">
        <div className="w-full min-h-[58px] flex items-center justify-between gap-[14px] px-1">
          <Link
            className="inline-flex items-center gap-2.5 text-[var(--ink)] px-2 no-underline min-h-11"
            href="/"
          >
            <span className="size-9 inline-flex items-center justify-center rounded-lg bg-[var(--ink)] text-[var(--paper)] font-black">
              SH
            </span>
            <strong>StudentHub</strong>
          </Link>
          <div className="flex items-center gap-3.5 max-sm:flex-col max-sm:items-stretch">
            {isLoggedIn ? (
              <Button variant="default" size="default" asChild>
                <Link href="/app">
                  Open app <ChevronRight className="size-3.5" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="default" size="default" asChild>
                  <Link href="/signup?role=company">
                    Set up company account <Sparkles className="size-3.5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="default" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* ── Hero — company-specific ── */}
      <HeroSection />

      {/* ── Pain-point section — the specific hiring pain points ── */}
      <section
        className="relative overflow-hidden rounded-xl p-[clamp(24px,5vw,48px)] bg-white border border-border"
        aria-label="Hiring pain points and solutions"
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#fef1ef] via-white to-[var(--paper)] z-0" aria-hidden="true" />

        <div className="relative z-[2]">
          <p className="text-[var(--sh-coral)] text-[11px] font-black uppercase tracking-wider mb-1">
            The real hiring headache
          </p>
          <h2 className="text-[clamp(22px,3.4vw,38px)] font-black leading-[1.08] tracking-tight text-[var(--ink)] mb-8">
            You don&apos;t have a talent problem.
            <br />
            You have a <em className="text-[var(--sh-coral)]">process</em>{" "}
            problem.
          </h2>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
            {PAIN_POINTS.map((point, i) => (
              <div
                key={i}
                className="rounded-xl p-5 flex flex-col gap-3 transition-transform duration-300 hover:-translate-y-[3px] bg-white border border-border"
              >
                <div
                  className="size-10 rounded-lg flex items-center justify-center shrink-0 bg-[var(--sh-coral)]/15 text-[var(--sh-coral)]"
                >
                  <span className="font-black text-sm">0{i + 1}</span>
                </div>
                <div>
                  <p
                    className="text-sm font-semibold mb-1.5 text-[var(--ink)]"
                  >
                    {point.problem}
                  </p>
                  <p
                    className="text-sm leading-relaxed text-[var(--muted)]"
                  >
                    {point.solution}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats strip — company authority signals ── */}
      <section
        className="rounded-xl p-[clamp(20px,4vw,40px)] grid grid-cols-2 sm:grid-cols-4 gap-6 text-center bg-white border border-border"
        aria-label="Company stats"
      >
        {COMPANY_STATS.map((stat) => (
          <div key={stat.label}>
            <p className="text-[clamp(24px,4vw,36px)] font-black leading-none mb-1">
              {stat.value}
            </p>
            <p
              className="text-xs leading-tight text-[var(--muted)]"
            >
              {stat.label}
            </p>
          </div>
        ))}
      </section>

      {/* ── Features — company-specific ── */}
      <FeatureGrid persona="company" />

      {/* ── Social proof — company testimonials ── */}
      <TestimonialCarousel persona="company" />

      {/* ── Comparison — StudentHub vs alternatives ── */}
      <ComparisonTable persona="company" />

      {/* ── Pricing — company pricing tiers ── */}
      <PricingCard persona="company" />

      {/* ── Final CTA — tailored for employers ── */}
      <section
        className="relative overflow-hidden rounded-xl p-[clamp(24px,5vw,60px)] text-center bg-white border border-border"
        aria-label="Get started as a company"
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#fef1ef] via-white to-[var(--paper)] z-0" aria-hidden="true" />

        <div className="relative z-[2] max-w-[640px] mx-auto">
          <p className="text-[var(--sh-coral)] text-[11px] font-black uppercase tracking-wider mb-2">
            Let StudentHub handle your workforce
          </p>
          <h2 className="text-[clamp(22px,3.4vw,38px)] font-black leading-[1.08] tracking-tight text-[var(--ink)] text-center">
            Stop managing staff. Start running your business.
          </h2>
          <p
            className="max-w-[480px] mx-auto mt-2 mb-6 leading-relaxed text-[var(--muted)]"
          >
            StudentHub handles everything — sourcing, placement, compliance, payroll.
            You get pre-vetted student workers on a simple monthly fee or hourly rate.
            No recruitment costs, no HR paperwork, no compliance headaches.
          </p>
          {isLoggedIn ? (
            <Button variant="default" size="lg" asChild>
              <Link href="/app">
                Open app <ChevronRight className="size-4" />
              </Link>
            </Button>
          ) : (
            <Button variant="default" size="lg" asChild>
              <Link href="/signup?role=company">
                Set up your company account <ChevronRight className="size-4" />
              </Link>
            </Button>
          )}
          <div
            className="flex items-center justify-center gap-4 mt-4 text-xs text-[var(--muted)]"
          >
            <span>200+ companies using StudentHub</span>
            <span>48h avg time to first match</span>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="flex items-center justify-between pt-4 pb-2 text-xs text-[var(--muted)]"
      >
        <span>&copy; {new Date().getFullYear()} StudentHub. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hover:text-[var(--ink)] transition-colors no-underline"
          >
            Sign in
          </Link>
          <Link
            href="/signup?role=company"
            className="hover:text-[var(--ink)] transition-colors no-underline"
          >
            Sign up as company
          </Link>
        </div>
      </footer>
    </main>
    </>
  );
}
