"use client";

import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
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
    problem: "Sifting through hundreds of applicants who aren't a fit",
    solution:
      "AI matching surfaces only the candidates who meet your requirements. Review 4 qualified profiles, not 400 random CVs.",
  },
  {
    problem: "Chasing timesheets and invoices across 12 locations",
    solution:
      "Timesheet approvals, consolidated invoicing, and payment processing — all from one dashboard. Month-end close in 3 days.",
  },
  {
    problem: "Compliance risk from expired certifications",
    solution:
      "Auto-verify right-to-work documents. Track expiring certs. Maintain audit-ready records without extra headcount.",
  },
];

const COMPANY_STATS = [
  { value: "48h", label: "avg time-to-candidate-match" },
  { value: "200+", label: "employers hiring on StudentHub" },
  { value: "99.7%", label: "audit pass rate" },
  { value: "3d", label: "month-end close" },
];

// ── Component ─────────────────────────────────────────────────

export default function CompanyLandingContent({
  session,
}: CompanyLandingContentProps) {
  const isLoggedIn = Boolean(session);

  return (
    <main className="min-h-svh w-[min(1320px,calc(100%_-_28px))] mx-auto grid content-start gap-6 pt-[18px] pb-[42px] max-sm:w-[min(calc(100%_-_20px),720px)]">
      {/* ── Glass Navigation ── */}
      <nav className="shGlassNav" aria-label="StudentHub public navigation">
        <div className="shGlassNavInner">
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
              <Link
                href="/app"
                className="uiButton uiButton_default uiButton_defaultSize"
              >
                Open app <ChevronRight className="size-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/signup?role=company"
                  className="uiButton uiButton_default uiButton_defaultSize"
                >
                  Set up company account <Sparkles className="size-3.5" />
                </Link>
                <Link
                  href="/login"
                  className="uiButton uiButton_ghost uiButton_defaultSize"
                >
                  Sign in
                </Link>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* ── Hero — company-specific ── */}
      <HeroSection persona="company" />

      {/* ── Pain-point section — the specific hiring pain points ── */}
      <section
        className="shSection relative overflow-hidden rounded-xl p-[clamp(24px,5vw,48px)]"
        style={{
          background: "var(--sh-glass-bg)",
          border: "1px solid var(--sh-glass-border)",
        }}
        aria-label="Hiring pain points and solutions"
      >
        <div className="shHeroGradientDramatic" aria-hidden="true" />

        <div className="relative z-[2]">
          <p className="text-[var(--sh-info)] text-[11px] font-black uppercase tracking-wider mb-1">
            The real hiring headache
          </p>
          <h2 className="shBenefitsTitle mb-8">
            You don&apos;t have a talent problem.
            <br />
            You have a <em style={{ color: "var(--sh-info)" }}>process</em>{" "}
            problem.
          </h2>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
            {PAIN_POINTS.map((point, i) => (
              <div
                key={i}
                className="rounded-xl p-5 flex flex-col gap-3 transition-transform duration-300 hover:-translate-y-[3px]"
                style={{
                  background: "var(--sh-glass-bg)",
                  border: "1px solid var(--sh-glass-border)",
                }}
              >
                <div
                  className="size-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: "color-mix(in srgb, var(--sh-info) 15%, transparent)",
                    color: "var(--sh-info)",
                  }}
                >
                  <span className="font-black text-sm">0{i + 1}</span>
                </div>
                <div>
                  <p
                    className="text-sm font-semibold mb-1.5"
                    style={{ color: "var(--ink)" }}
                  >
                    {point.problem}
                  </p>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--muted)" }}
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
        className="shSection rounded-xl p-[clamp(20px,4vw,40px)] grid grid-cols-2 sm:grid-cols-4 gap-6 text-center"
        style={{
          background: "var(--sh-glass-bg)",
          border: "1px solid var(--sh-glass-border)",
        }}
        aria-label="Company stats"
      >
        {COMPANY_STATS.map((stat) => (
          <div key={stat.label}>
            <p className="text-[clamp(24px,4vw,36px)] font-black leading-none mb-1">
              {stat.value}
            </p>
            <p
              className="text-xs leading-tight"
              style={{ color: "var(--muted)" }}
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
        className="shSection relative overflow-hidden rounded-xl p-[clamp(24px,5vw,60px)] text-center"
        style={{
          background: "var(--sh-glass-bg)",
          border: "1px solid var(--sh-glass-border)",
        }}
        aria-label="Get started as a company"
      >
        <div className="shHeroGradientDramatic" aria-hidden="true" />

        <div className="relative z-[2] max-w-[640px] mx-auto">
          <p className="text-[var(--sh-info)] text-[11px] font-black uppercase tracking-wider mb-2">
            Start hiring today
          </p>
          <h2 className="shBenefitsTitle text-center">
            Your next hire is one post away.
          </h2>
          <p
            className="max-w-[480px] mx-auto mt-2 mb-6 leading-relaxed"
            style={{ color: "var(--muted)" }}
          >
            Post your first opening and get matched candidates within 48 hours.
            Set up your company account in under 5 minutes. No setup fee, no
            minimum commitment.
          </p>
          {isLoggedIn ? (
            <Link
              href="/app"
              className="uiButton uiButton_default uiButton_lg shGlowButton"
            >
              Open app <ChevronRight className="size-4" />
            </Link>
          ) : (
            <Link
              href="/signup?role=company"
              className="uiButton uiButton_default uiButton_lg shGlowButton"
            >
              Set up your company account <ChevronRight className="size-4" />
            </Link>
          )}
          <div
            className="flex items-center justify-center gap-4 mt-4 text-xs"
            style={{ color: "var(--muted)" }}
          >
            <span>200+ employers hiring on StudentHub</span>
            <span>3-day avg time-to-shortlist</span>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="shSection flex items-center justify-between pt-4 pb-2 text-xs"
        style={{ color: "var(--muted)" }}
      >
        <span>&copy; {new Date().getFullYear()} StudentHub. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hover:text-[var(--ink)] transition-colors no-underline"
            style={{ color: "inherit" }}
          >
            Sign in
          </Link>
          <Link
            href="/signup?role=company"
            className="hover:text-[var(--ink)] transition-colors no-underline"
            style={{ color: "inherit" }}
          >
            Sign up as company
          </Link>
        </div>
      </footer>
    </main>
  );
}
