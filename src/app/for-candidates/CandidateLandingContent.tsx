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

export interface CandidateLandingContentProps {
  session: {
    id: string;
    email: string;
    role: string;
    name: string;
  } | null;
}

// ── Candidate-specific copy ───────────────────────────────────

const PAIN_POINTS = [
  {
    problem: "Hundreds of job boards, zero coherent replies",
    solution:
      "Stop juggling 14 tabs. StudentHub surfaces only the roles that match your skills and experience. No blind applications, no spam from recruiters who never read your CV.",
  },
  {
    problem: "Your time is billable — chasing paperwork isn't",
    solution:
      "Log hours, submit timesheets, and get paid — all in one place. No chasing paper forms, no separate payroll portals, no lost invoices.",
  },
  {
    problem: "Your profile should work as hard as you do",
    solution:
      "Build a single profile that represents your full work history, certifications, and availability. Update once — every matched employer sees the latest you.",
  },
];

const CANDIDATE_STATS = [
  { value: "1,200+", label: "candidates placed this year" },
  { value: "92%", label: "match accuracy rate" },
  { value: "3 min", label: "avg profile setup time" },
  { value: "4.8★", label: "candidate satisfaction" },
];

// ── Component ─────────────────────────────────────────────────

export default function CandidateLandingContent({
  session,
}: CandidateLandingContentProps) {
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
                  href="/signup?role=candidate"
                  className="uiButton uiButton_default uiButton_defaultSize"
                >
                  Create free profile <Sparkles className="size-3.5" />
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

      {/* ── Hero — candidate-specific ── */}
      <HeroSection persona="candidate" />

      {/* ── Pain-point section — the real candidate frustrations ── */}
      <section
        className="shSection relative overflow-hidden rounded-xl p-[clamp(24px,5vw,48px)]"
        style={{
          background: "var(--sh-glass-bg)",
          border: "1px solid var(--sh-glass-border)",
        }}
        aria-label="Candidate pain points and solutions"
      >
        <div className="shHeroGradientDramatic" aria-hidden="true" />

        <div className="relative z-[2]">
          <p className="text-[var(--sh-info)] text-[11px] font-black uppercase tracking-wider mb-1">
            The real job-search headache
          </p>
          <h2 className="shBenefitsTitle mb-8">
            You don&apos;t need another job board.
            <br />
            You need a way to{" "}
            <em style={{ color: "var(--sh-info)" }}>stand out</em>{" "}
            without the noise.
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

      {/* ── Stats strip — candidate authority signals ── */}
      <section
        className="shSection rounded-xl p-[clamp(20px,4vw,40px)] grid grid-cols-2 sm:grid-cols-4 gap-6 text-center"
        style={{
          background: "var(--sh-glass-bg)",
          border: "1px solid var(--sh-glass-border)",
        }}
        aria-label="Candidate stats"
      >
        {CANDIDATE_STATS.map((stat) => (
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

      {/* ── Features — candidate-specific ── */}
      <FeatureGrid persona="candidate" />

      {/* ── Social proof — candidate testimonials ── */}
      <TestimonialCarousel persona="candidate" />

      {/* ── Comparison — StudentHub vs alternatives ── */}
      <ComparisonTable persona="candidate" />

      {/* ── Pricing — candidate-specific (free tier) ── */}
      <PricingCard persona="candidate" />

      {/* ── Final CTA — tailored for candidates ── */}
      <section
        className="shSection relative overflow-hidden rounded-xl p-[clamp(24px,5vw,60px)] text-center"
        style={{
          background: "var(--sh-glass-bg)",
          border: "1px solid var(--sh-glass-border)",
        }}
        aria-label="Get started as a candidate"
      >
        <div className="shHeroGradientDramatic" aria-hidden="true" />

        <div className="relative z-[2] max-w-[640px] mx-auto">
          <p className="text-[var(--sh-info)] text-[11px] font-black uppercase tracking-wider mb-2">
            Start your placement journey
          </p>
          <h2 className="shBenefitsTitle text-center">
            Your next role is one profile away.
          </h2>
          <p
            className="max-w-[480px] mx-auto mt-2 mb-6 leading-relaxed"
            style={{ color: "var(--muted)" }}
          >
            Create your free profile in under 3 minutes. No CV required — just
            your experience and what you&apos;re looking for. Employers are hiring
            on StudentHub right now.
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
              href="/signup?role=candidate"
              className="uiButton uiButton_default uiButton_lg shGlowButton"
            >
              Create your free candidate profile{" "}
              <ChevronRight className="size-4" />
            </Link>
          )}
          <div
            className="flex items-center justify-center gap-4 mt-4 text-xs"
            style={{ color: "var(--muted)" }}
          >
            <span>1,200+ candidates placed this year</span>
            <span>4.8★ candidate satisfaction</span>
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
            href="/signup?role=candidate"
            className="hover:text-[var(--ink)] transition-colors no-underline"
            style={{ color: "inherit" }}
          >
            Sign up as candidate
          </Link>
        </div>
      </footer>
    </main>
  );
}
