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

export interface StaffLandingContentProps {
  session: {
    id: string;
    email: string;
    role: string;
    name: string;
  } | null;
}

// ── Staff-specific copy ───────────────────────────────────────

const PAIN_POINTS = [
  {
    problem: "Hours wasted matching candidates to roles manually",
    solution:
      "Staff-powered matching surfaces the right candidates for every open role in seconds. Filter by qualification, availability, and location — no more spreadsheets and gut feelings.",
  },
  {
    problem: "Placement paperwork drowning your desk",
    solution:
      "Contracts, timesheets, and compliance docs auto-generate from placement data. Approve with one click. Every document is audit-ready from day one.",
  },
  {
    problem: "Compliance deadlines that keep you up at night",
    solution:
      "Automated expiry tracking for right-to-work documents, certifications, and visa status. Get notified 30, 14, and 7 days before anything lapses.",
  },
];

const STAFF_STATS = [
  { value: "350+", label: "agencies on StudentHub" },
  { value: "62%", label: "faster placement time" },
  { value: "99.7%", label: "compliance audit pass rate" },
  { value: "15k+", label: "workers under management" },
];

// ── Component ─────────────────────────────────────────────────

export default function StaffLandingContent({
  session,
}: StaffLandingContentProps) {
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
                    href="/signup?role=staff"
                    className="uiButton uiButton_default uiButton_defaultSize"
                  >
                    Request staff access <Sparkles className="size-3.5" />
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

        {/* ── Hero — staff-specific ── */}
        <HeroSection />

        {/* ── Pain-point section — the staffing frustrations ── */}
        <section
          className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-[clamp(24px,5vw,48px)]"
          aria-label="Staffing pain points and solutions"
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#fef1ef] via-white to-gray-50 z-0" aria-hidden="true" />

          <div className="relative z-[2]">
            <p className="text-[#1f73b7] text-[11px] font-black uppercase tracking-wider mb-1">
              The real staffing headache
            </p>
            <h2 className="text-[clamp(22px,3vw,28px)] font-bold leading-tight tracking-tight text-gray-900 mb-8">
              You don&apos;t need another spreadsheet.
              <br />
              You need a{" "}
              <em className="text-[#1f73b7] not-italic">faster</em> way
              to place candidates.
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

        {/* ── Stats strip — staff authority signals ── */}
        <section
          className="rounded-xl border border-gray-200 bg-gray-50 p-[clamp(20px,4vw,40px)] grid grid-cols-2 sm:grid-cols-4 gap-6 text-center"
          aria-label="Staffing stats"
        >
          {STAFF_STATS.map((stat) => (
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

        {/* ── Features — staff-specific ── */}
        <FeatureGrid persona="staff" />

        {/* ── Social proof — staff testimonials ── */}
        <TestimonialCarousel persona="candidate" />

        {/* ── Comparison — StudentHub vs alternatives ── */}
        <ComparisonTable persona="candidate" />

        {/* ── Pricing — staff pricing tiers ── */}
        <PricingCard persona="staff" />

        {/* ── Final CTA — tailored for staffing agencies ── */}
        <section
          className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-[clamp(24px,5vw,60px)] text-center"
          aria-label="Get started as staff"
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#fef1ef] via-white to-gray-50 z-0" aria-hidden="true" />

          <div className="relative z-[2] max-w-[640px] mx-auto">
            <p className="text-[#1f73b7] text-[11px] font-black uppercase tracking-wider mb-2">
              Start placing faster
            </p>
            <h2 className="text-[clamp(24px,4vw,36px)] font-bold leading-tight tracking-tight text-gray-900 text-center">
              Your next placement is one search away.
            </h2>
            <p className="max-w-[480px] mx-auto mt-2 mb-6 leading-relaxed text-gray-500">
              Start searching, shortlisting, and placing candidates
              immediately. Access the full staffing toolkit from day one. No
              setup fee, no minimum commitment.
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
                href="/signup?role=staff"
                className="uiButton uiButton_default uiButton_lg shGlowButton"
              >
                Get staff access <ChevronRight className="size-4" />
              </Link>
            )}
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
              <span>350+ agencies on StudentHub</span>
              <span>62% faster placement</span>
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
              href="/signup?role=staff"
              className="hover:text-gray-900 transition-colors no-underline text-gray-500"
            >
              Sign up as staff
            </Link>
          </div>
        </footer>
      </main>
    </>
  );
}
