"use client";

import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";
import { HeroSection } from "@/components/marketing";
import { FeatureGrid } from "@/components/marketing";
import { TestimonialCarousel } from "@/components/marketing";
import { PricingCard } from "@/components/marketing";
import { ComparisonTable } from "@/components/marketing";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
        {/* ── Navigation ── */}
        <nav className="sticky top-[3px] z-20 min-h-[62px] flex items-center justify-between gap-[14px] rounded-xl p-[2px] bg-card shadow-md border-border border" aria-label="StudentHub public navigation">
          <div className="w-full min-h-[58px] flex items-center justify-between gap-[14px] px-1">
            <Link
              className="inline-flex items-center gap-2.5 text-foreground px-2 no-underline min-h-11"
              href="/"
            >
              <span className="size-9 inline-flex items-center justify-center rounded-lg bg-foreground text-background font-black">
                SH
              </span>
              <strong>StudentHub</strong>
            </Link>
            <div className="flex items-center gap-3.5 max-sm:flex-col max-sm:items-stretch">
              {isLoggedIn ? (
                <Link href="/app">
                  <Button size="default">
                    Open app <ChevronRight className="size-3.5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/signup?role=inspector">
                    <Button size="default">
                      Request inspector access <Sparkles className="size-3.5" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="ghost" size="default">
                      Sign in
                    </Button>
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
        <Card className="relative overflow-hidden p-[clamp(24px,5vw,48px)]" aria-label="Inspector pain points and solutions">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#fef1ef] via-white to-background z-0" aria-hidden="true" />

          <div className="relative z-[2]">
            <p className="text-info text-[11px] font-black uppercase tracking-wider mb-1">
              The real compliance challenge
            </p>
            <h2 className="shBenefitsTitle mb-8">
              You don&apos;t need more paperwork.
              <br />
              You need{" "}
              <em className="text-info not-italic">instant</em>{" "}
              on-site validation.
            </h2>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
              {PAIN_POINTS.map((point, i) => (
                <Card key={i} className="p-5 flex flex-col gap-3 transition-transform duration-300 hover:-translate-y-[3px]">
                  <div className="size-10 rounded-lg flex items-center justify-center shrink-0 bg-info/15 text-info">
                    <span className="font-black text-sm">0{i + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-1.5 text-foreground">
                      {point.problem}
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {point.solution}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Card>

        {/* ── Stats strip — inspector authority signals ── */}
        <Card className="p-[clamp(20px,4vw,40px)] grid grid-cols-2 sm:grid-cols-4 gap-6 text-center" aria-label="Inspector stats">
          {INSPECTOR_STATS.map((stat) => (
            <div key={stat.label}>
              <p className="text-[clamp(24px,4vw,36px)] font-black leading-none mb-1">
                {stat.value}
              </p>
              <p className="text-xs leading-tight text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </Card>

        {/* ── Features — inspector-specific ── */}
        <FeatureGrid persona="inspector" />

        {/* ── Social proof — inspector testimonials ── */}
        <TestimonialCarousel persona="candidate" />

        {/* ── Comparison — StudentHub vs alternatives ── */}
        <ComparisonTable persona="candidate" />

        {/* ── Pricing — inspector pricing tiers ── */}
        <PricingCard persona="inspector" />

        {/* ── Final CTA — tailored for inspectors ── */}
        <Card className="relative overflow-hidden p-[clamp(24px,5vw,60px)] text-center" aria-label="Get started as inspector">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#fef1ef] via-white to-background z-0" aria-hidden="true" />

          <div className="relative z-[2] max-w-[640px] mx-auto">
            <p className="text-info text-[11px] font-black uppercase tracking-wider mb-2">
              Validate workers instantly — on-site or remote
            </p>
            <h2 className="shBenefitsTitle text-center">
              Government-level compliance, zero onboarding friction.
            </h2>
            <p className="max-w-[480px] mx-auto mt-2 mb-6 leading-relaxed text-muted-foreground">
              StudentHub gives government inspectors immediate access — no onboarding
              required. Scan any worker&apos;s QR code ID card to validate right-to-work
              status, certifications, and placement details on the spot. Audit-ready
              reports in minutes.
            </p>
            {isLoggedIn ? (
              <Link href="/app">
                <Button size="lg">
                  Open app <ChevronRight className="size-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/signup?role=inspector">
                <Button size="lg">
                  Get inspector access <ChevronRight className="size-4" />
                </Button>
              </Link>
            )}
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <span>Instant QR code validation</span>
              <span>Zero onboarding for inspectors</span>
            </div>
          </div>
        </Card>

        {/* ── Footer ── */}
        <footer className="shSection flex items-center justify-between pt-4 pb-2 text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} StudentHub. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hover:text-foreground transition-colors no-underline"
            >
              Sign in
            </Link>
            <Link
              href="/signup?role=inspector"
              className="hover:text-foreground transition-colors no-underline"
            >
              Sign up as inspector
            </Link>
          </div>
        </footer>
      </main>
    </>
  );
}
