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

export interface AdminLandingContentProps {
  session: {
    id: string;
    email: string;
    role: string;
    name: string;
  } | null;
}

// ── Admin-specific copy ────────────────────────────────────────

const PAIN_POINTS = [
  {
    problem: "Juggling a dozen logins just to run payroll",
    solution:
      "One workspace replaces your entire tool stack — user management, financial oversight, compliance monitoring, and payroll. No more context switching between platforms.",
  },
  {
    problem: "Spreadsheets can't keep up with compliance",
    solution:
      "Automated audit trails with real-time flagging. Every worker, document, and certification tracked from onboarding to offboarding. 99.7% audit pass rate.",
  },
  {
    problem: "No visibility across departments and locations",
    solution:
      "Role-based dashboards give you the big picture. See headcount, budget utilization, compliance status, and placement velocity across every branch — all in one view.",
  },
];

const ADMIN_STATS = [
  { value: "15k+", label: "worker records managed" },
  { value: "99.7%", label: "audit pass rate" },
  { value: "3d", label: "month-end close time" },
  { value: "12", label: "systems consolidated into one" },
];

// ── Component ─────────────────────────────────────────────────

export default function AdminLandingContent({
  session,
}: AdminLandingContentProps) {
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
        <nav className="sticky top-[3px] z-20 min-h-[62px] flex items-center justify-between gap-[14px] rounded-xl p-[2px] bg-white shadow-md border border-gray-200" aria-label="StudentHub public navigation">
          <div className="w-full min-h-[58px] flex items-center justify-between gap-[14px] px-1">
            <Link
              className="inline-flex items-center gap-2.5 text-gray-900 px-2 no-underline min-h-11"
              href="/"
            >
              <span className="size-9 inline-flex items-center justify-center rounded-lg bg-gray-900 text-white font-black">
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
                    href="/signup?role=admin"
                    className="uiButton uiButton_default uiButton_defaultSize"
                  >
                    Request admin access <Sparkles className="size-3.5" />
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

        {/* ── Hero — admin-specific ── */}
        <HeroSection />

        {/* ── Pain-point section — the admin frustrations ── */}
        <section
          className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-[clamp(24px,5vw,48px)]"
          aria-label="Admin pain points and solutions"
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#fef1ef] via-white to-gray-50 z-0" aria-hidden="true" />

          <div className="relative z-[2]">
            <p className="text-[#1f73b7] text-[11px] font-black uppercase tracking-wider mb-1">
              The real admin headache
            </p>
            <h2 className="text-[clamp(22px,3vw,28px)] font-bold leading-tight tracking-tight text-gray-900 mb-8">
              You don&apos;t need another login.
              <br />
              You need a{" "}
              <em className="text-[#1f73b7] not-italic">single</em>{" "}
              source of truth.
            </h2>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
              {PAIN_POINTS.map((point, i) => (
                <div
                  key={i}
                  className="rounded-xl p-5 flex flex-col gap-3 transition-transform duration-300 hover:-translate-y-[3px] bg-gray-50 border border-gray-200"
                >
                  <div className="size-10 rounded-lg flex items-center justify-center shrink-0 bg-[#1f73b7]/10 text-[#1f73b7]">
                    <span className="font-black text-sm">0{i + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-1.5 text-gray-900">
                      {point.problem}
                    </p>
                    <p className="text-sm leading-relaxed text-gray-500">
                      {point.solution}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats strip — admin authority signals ── */}
        <section
          className="rounded-xl border border-gray-200 bg-gray-50 p-[clamp(20px,4vw,40px)] grid grid-cols-2 sm:grid-cols-4 gap-6 text-center"
          aria-label="Admin stats"
        >
          {ADMIN_STATS.map((stat) => (
            <div key={stat.label}>
              <p className="text-[clamp(24px,4vw,36px)] font-black leading-none mb-1 text-gray-900">
                {stat.value}
              </p>
              <p className="text-xs leading-tight text-gray-500">
                {stat.label}
              </p>
            </div>
          ))}
        </section>

        {/* ── Features — admin-specific ── */}
        <FeatureGrid persona="admin" />

        {/* ── Social proof — admin testimonials ── */}
        <TestimonialCarousel persona="company" />

        {/* ── Comparison — StudentHub vs alternatives ── */}
        <ComparisonTable persona="company" />

        {/* ── Pricing — admin pricing tiers ── */}
        <PricingCard persona="admin" />

        {/* ── Final CTA — tailored for administrators ── */}
        <section
          className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-[clamp(24px,5vw,60px)] text-center"
          aria-label="Get started as admin"
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#fef1ef] via-white to-gray-50 z-0" aria-hidden="true" />

          <div className="relative z-[2] max-w-[640px] mx-auto">
            <p className="text-[#1f73b7] text-[11px] font-black uppercase tracking-wider mb-2">
              Take control of operations
            </p>
            <h2 className="text-[clamp(24px,4vw,36px)] font-bold leading-tight tracking-tight text-gray-900 text-center">
              Your next dashboard is one login away.
            </h2>
            <p className="max-w-[480px] mx-auto mt-2 mb-6 leading-relaxed text-gray-500">
              Get full visibility across users, finances, compliance, and
              payroll. One workspace replaces a dozen logins. No setup fee,
              no minimum commitment.
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
                href="/signup?role=admin"
                className="uiButton uiButton_default uiButton_lg shGlowButton"
              >
                Get admin access <ChevronRight className="size-4" />
              </Link>
            )}
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
              <span>15,000+ worker records managed</span>
              <span>99.7% audit pass rate</span>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="flex items-center justify-between pt-4 pb-2 text-xs text-gray-500">
          <span>&copy; {new Date().getFullYear()} StudentHub. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hover:text-gray-900 transition-colors no-underline text-gray-500"
            >
              Sign in
            </Link>
            <Link
              href="/signup?role=admin"
              className="hover:text-gray-900 transition-colors no-underline text-gray-500"
            >
              Sign up as admin
            </Link>
          </div>
        </footer>
      </main>
    </>
  );
}
