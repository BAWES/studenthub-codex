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

export interface InspectorLandingContentProps {
  session: {
    id: string;
    email: string;
    role: string;
    name: string;
  } | null;
}

// ── Inspector-specific copy ────────────────────────────────────

const PAIN_POINTS = [
  {
    problem: "No quick way to validate workers on-site",
    solution:
      "Every worker on StudentHub wears an ID card with a QR code. Scan it on-site to instantly verify right-to-work status, certifications, and placement details. No paperwork, no phone calls — just a scan.",
  },
  {
    problem: "Government inspectors need access without onboarding delays",
    solution:
      "StudentHub gives government inspectors immediate access — no onboarding required. Validate any worker across any company from a single dashboard. On-site, in-office, or remote.",
  },
  {
    problem: "Manual compliance checks across hundreds of workers",
    solution:
      "Batch-verify worker documents, track certification expiries, and maintain full audit trails. Every verification action is timestamped and immutable. Audit-ready reports in minutes.",
  },
];

const INSPECTOR_STATS = [
  { value: "Instant", label: "QR code worker validation" },
  { value: "Zero", label: "onboarding required for inspectors" },
  { value: "100%", label: "audit trail completeness" },
  { value: "99.7%", label: "compliance pass rate" },
];

// ── Component ─────────────────────────────────────────────────

export default function InspectorLandingContent({
  session,
}: InspectorLandingContentProps) {
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
        className="min-h-svh w-[min(1320px,calc(100%_-_28px))] mx-auto grid content-start gap-6 pt-[18px] pb-[42px] max-sm:w-[min(calc(100%_-_20px),720px)]"
      >
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
                    href="/signup?role=inspector"
                    className="uiButton uiButton_default uiButton_defaultSize"
                  >
                    Request inspector access <Sparkles className="size-3.5" />
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

        {/* ── Hero — inspector-specific ── */}
        <HeroSection />

        {/* ── Pain-point section — inspector frustrations ── */}
        <section
          className="shSection relative overflow-hidden rounded-xl p-[clamp(24px,5vw,48px)]"
          style={{
            background: "var(--sh-glass-bg)",
            border: "1px solid var(--sh-glass-border)",
          }}
          aria-label="Inspector pain points and solutions"
        >
          <div className="shHeroGradientDramatic" aria-hidden="true" />

          <div className="relative z-[2]">
            <p className="text-[var(--sh-info)] text-[11px] font-black uppercase tracking-wider mb-1">
              The real compliance challenge
            </p>
            <h2 className="shBenefitsTitle mb-8">
              You don&apos;t need more paperwork.
              <br />
              You need{" "}
              <em style={{ color: "var(--sh-info)" }}>instant</em>{" "}
              on-site validation.
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
                      background:
                        "color-mix(in srgb, var(--sh-info) 15%, transparent)",
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

        {/* ── Stats strip — inspector authority signals ── */}
        <section
          className="shSection rounded-xl p-[clamp(20px,4vw,40px)] grid grid-cols-2 sm:grid-cols-4 gap-6 text-center"
          style={{
            background: "var(--sh-glass-bg)",
            border: "1px solid var(--sh-glass-border)",
          }}
          aria-label="Inspector stats"
        >
          {INSPECTOR_STATS.map((stat) => (
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

        {/* ── Features — inspector-specific ── */}
        <FeatureGrid persona="inspector" />

        {/* ── Social proof — inspector testimonials ── */}
        <TestimonialCarousel persona="inspector" />

        {/* ── Comparison — StudentHub vs alternatives ── */}
        <ComparisonTable persona="inspector" />

        {/* ── Pricing — inspector pricing tiers ── */}
        <PricingCard persona="inspector" />

        {/* ── Final CTA — tailored for inspectors ── */}
        <section
          className="shSection relative overflow-hidden rounded-xl p-[clamp(24px,5vw,60px)] text-center"
          style={{
            background: "var(--sh-glass-bg)",
            border: "1px solid var(--sh-glass-border)",
          }}
          aria-label="Get started as inspector"
        >
          <div className="shHeroGradientDramatic" aria-hidden="true" />

          <div className="relative z-[2] max-w-[640px] mx-auto">
            <p className="text-[var(--sh-info)] text-[11px] font-black uppercase tracking-wider mb-2">
              Validate workers instantly — on-site or remote
            </p>
            <h2 className="shBenefitsTitle text-center">
              Government-level compliance, zero onboarding friction.
            </h2>
            <p
              className="max-w-[480px] mx-auto mt-2 mb-6 leading-relaxed"
              style={{ color: "var(--muted)" }}
            >
              StudentHub gives government inspectors immediate access — no onboarding
              required. Scan any worker&apos;s QR code ID card to validate right-to-work
              status, certifications, and placement details on the spot. Audit-ready
              reports in minutes.
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
                href="/signup?role=inspector"
                className="uiButton uiButton_default uiButton_lg shGlowButton"
              >
                Get inspector access <ChevronRight className="size-4" />
              </Link>
            )}
            <div
              className="flex items-center justify-center gap-4 mt-4 text-xs"
              style={{ color: "var(--muted)" }}
            >
              <span>Instant QR code validation</span>
              <span>Zero onboarding for inspectors</span>
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
              href="/signup?role=inspector"
              className="hover:text-[var(--ink)] transition-colors no-underline"
              style={{ color: "inherit" }}
            >
              Sign up as inspector
            </Link>
          </div>
        </footer>
      </main>
    </>
  );
}
