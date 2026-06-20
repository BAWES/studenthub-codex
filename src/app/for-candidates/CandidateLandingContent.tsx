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
        className="min-h-svh w-[min(1320px,calc(100%_-_28px))] mx-auto grid content-start gap-6 pt-[18px] pb-[42px] max-sm:w-[min(calc(100%_-_20px),720px)]"
      >
        {/* ── Navigation ── */}
        <nav
          className="sticky top-[3px] z-20 min-h-[62px] flex items-center justify-between gap-[14px] rounded-xl p-[2px] bg-card shadow-md border-border border"
          aria-label="StudentHub public navigation"
        >
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
                  <Link href="/signup?role=candidate">
                    <Button size="default">
                      Create free profile <Sparkles className="size-3.5" />
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

        {/* ── Hero — candidate-specific ── */}
        <HeroSection />

        {/* ── Pain-point section — the real candidate frustrations ── */}
        <section
          className="relative overflow-hidden rounded-xl border border-border bg-card p-[clamp(24px,5vw,48px)]"
          aria-label="Candidate pain points and solutions"
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#fef1ef] via-background to-muted/30 z-0" aria-hidden="true" />

          <div className="relative z-[2]">
            <p className="text-[#1f73b7] text-[11px] font-black uppercase tracking-wider mb-1">
              The real work experience problem
            </p>
            <h2 className="text-[clamp(22px,3vw,28px)] font-bold leading-tight tracking-tight text-foreground mb-8">
              You don&apos;t need another job board.
              <br />
              You need{" "}
              <em className="text-[#eb6651] not-italic">real experience</em>{" "}
              across multiple industries.
            </h2>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
              {PAIN_POINTS.map((point, i) => (
                <Card
                  key={i}
                  className="p-5 flex flex-col gap-3 transition-transform duration-300 hover:-translate-y-[3px]"
                >
                  <div className="size-10 rounded-lg flex items-center justify-center shrink-0 bg-[#1f73b7]/10 text-[#1f73b7]">
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
        </section>

        {/* ── Stats strip — candidate authority signals ── */}
        <section
          className="rounded-xl border border-border bg-muted/30 p-[clamp(20px,4vw,40px)] grid grid-cols-2 sm:grid-cols-4 gap-6 text-center"
          aria-label="Candidate stats"
        >
          {CANDIDATE_STATS.map((stat) => (
            <div key={stat.label}>
              <p className="text-[clamp(24px,4vw,36px)] font-black leading-none mb-1 text-foreground">
                {stat.value}
              </p>
              <p className="text-xs leading-tight text-muted-foreground">
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
          className="relative overflow-hidden rounded-xl border border-border bg-card p-[clamp(24px,5vw,60px)] text-center"
          aria-label="Get started as a candidate"
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#fef1ef] via-background to-muted/30 z-0" aria-hidden="true" />

          <div className="relative z-[2] max-w-[640px] mx-auto">
            <p className="text-[#1f73b7] text-[11px] font-black uppercase tracking-wider mb-2">
              Start building your career — free
            </p>
            <h2 className="text-[clamp(24px,3.5vw,36px)] font-bold leading-tight tracking-tight text-foreground text-center">
              Get real work experience that builds your CV.
            </h2>
            <p className="max-w-[480px] mx-auto mt-2 mb-6 leading-relaxed text-muted-foreground">
              Registration is completely free. StudentHub places you in real positions
              across multiple industries — 3 months per rotation. No CV required.
              By graduation, you&apos;ll have a stacked portfolio of experience.
            </p>
            {isLoggedIn ? (
              <Link href="/app">
                <Button size="lg">
                  Open app <ChevronRight className="size-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/signup?role=candidate">
                <Button size="lg">
                  Create your free candidate profile{" "}
                  <ChevronRight className="size-4" />
                </Button>
              </Link>
            )}
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <span>1,200+ active student placements</span>
              <span>Completely free for students</span>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="flex items-center justify-between pt-4 pb-2 text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} StudentHub. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hover:text-foreground transition-colors no-underline text-muted-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/signup?role=candidate"
              className="hover:text-foreground transition-colors no-underline text-muted-foreground"
            >
              Sign up as candidate
            </Link>
          </div>
        </footer>
      </main>
    </>
  );
}
