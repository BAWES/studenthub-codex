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
    problem: "Can't get hired without experience, can't get experience without a job",
    solution:
      "StudentHub places you in real work positions — no experience required. Every placement builds your CV, and after 3 months you rotate to a new role in a different industry. By graduation, you have a portfolio of diverse work experience, not just one line on your CV.",
  },
  {
    problem: "A single job for years gives you a thin CV",
    solution:
      "Most students graduate with one part-time job. StudentHub moves you across multiple placements — retail, admin, hospitality, customer service — so you graduate with a stacked CV that proves you can adapt to any environment.",
  },
  {
    problem: "Compliance paperwork is a nightmare",
    solution:
      "StudentHub handles all the compliance, payroll, and documentation. Your ID card with QR code verifies your right to work on the spot. Just show up, work your rotation, and build your future.",
  },
];

const CANDIDATE_STATS = [
  { value: "1,200+", label: "active student placements" },
  { value: "3 mo", label: "per position, then rotated" },
  { value: "92%", label: "match accuracy rate" },
  { value: "Free", label: "completely free for students" },
];

// ── Component ─────────────────────────────────────────────────

export default function CandidateLandingContent({
  session,
}: CandidateLandingContentProps) {
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
            The real work experience problem
          </p>
          <h2 className="shBenefitsTitle mb-8">
            You don&apos;t need another job board.
            <br />
            You need{" "}
            <em style={{ color: "var(--sh-info)" }}>real experience</em>{" "}
            across multiple industries.
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
            Start building your career — free
          </p>
          <h2 className="shBenefitsTitle text-center">
            Get real work experience that builds your CV.
          </h2>
          <p
            className="max-w-[480px] mx-auto mt-2 mb-6 leading-relaxed"
            style={{ color: "var(--muted)" }}
          >
            Registration is completely free. StudentHub places you in real positions
            across multiple industries — 3 months per rotation. No CV required.
            By graduation, you&apos;ll have a stacked portfolio of experience.
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
            <span>1,200+ active student placements</span>
            <span>Completely free for students</span>
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
    </>
  );
}
