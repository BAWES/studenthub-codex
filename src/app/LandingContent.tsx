"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Sparkles, GraduationCap, Building2 } from "lucide-react";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";
import { FadeInSection } from "@/components/marketing";
import { HeroSection } from "@/components/marketing";
import { TestimonialCarousel } from "@/components/marketing";
import { ComparisonTable } from "@/components/marketing";
import { HowItWorks } from "@/components/marketing";
import { EmployerSection } from "@/components/marketing";
import { StatsSection } from "@/components/marketing";
import { PersonaSwitcher } from "@/components/marketing";
import type { SwitcherPersona } from "@/components/marketing";

// ── Props ─────────────────────────────────────────────────────

export interface LandingContentProps {
  session: {
    id: string;
    email: string;
    role: string;
    name: string;
  } | null;
}


// ── Component ─────────────────────────────────────────────────

export default function LandingContent({ session }: LandingContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [persona, setPersona] = useState<SwitcherPersona>("candidate");

  // Sync persona from URL on mount
  useEffect(() => {
    const raw = searchParams.get("persona");
    if (raw === "company") {
      setPersona("company");
    } else {
      setPersona("candidate");
    }
  }, [searchParams]);

  // When persona changes, update URL
  const handlePersonaChange = useCallback(
    (newPersona: SwitcherPersona) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newPersona === "candidate") {
        params.delete("persona");
      } else {
        params.set("persona", newPersona);
      }
      const qs = params.toString();
      router.replace(qs ? `/?${qs}` : "/", { scroll: false });
    },
    [router, searchParams],
  );

  const isLoggedIn = Boolean(session);
  const role = persona === "company" ? "company" : "candidate";

  return (
    <>
      {/* ── Skip-to-content link ── */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[var(--ink)] focus:text-[var(--paper)] focus:no-underline focus:text-sm focus:font-semibold"
        style={{ color: "var(--paper)" }}
      >
        Skip to content
      </a>
      <main
        className="min-h-svh w-[min(1320px,calc(100%_-_28px))] mx-auto grid content-start gap-6 pt-[18px] pb-[42px] max-sm:w-[min(calc(100%_-_20px),720px)]"
        id="main-content"
      >
      {/* ── Glass Navigation ── */}
      <nav
        className="shGlassNav sticky top-3 z-50 backdrop-blur-xl"
        style={{ animation: "navSlideIn 0.6s var(--sh-easing)" }}
        aria-label="StudentHub public navigation"
      >
        <div className="shGlassNavInner">
          <Link
            className="inline-flex items-center gap-2.5 text-[var(--ink)] px-2 no-underline min-h-11"
            href="/"
          >
            <span className="size-9 inline-flex items-center justify-center rounded-lg bg-[var(--ink)] text-[var(--paper)] font-black tracking-tight">
              SH
            </span>
            <strong className="text-sm tracking-tight">StudentHub</strong>
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
                  href={`/signup?role=${role}`}
                  className="uiButton uiButton_default uiButton_defaultSize"
                >
                  {persona === "company" ? (
                    <><Building2 className="size-3.5" /> Set up company account</>
                  ) : (
                    <><GraduationCap className="size-3.5" /> Create free candidate profile</>
                  )}
                  <Sparkles className="size-3.5" />
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

      {/* ── Persona switcher — pick your role ── */}
      <div className="flex flex-col items-center gap-1.5">
        <h2 className="sr-only">Choose your perspective</h2>
        <PersonaSwitcher active={persona} onChange={handlePersonaChange} />
        <p className="text-[11px]" style={{ color: "var(--muted)" }}>
          {persona === "candidate"
            ? "I'm a student looking for work"
            : "I'm an employer hiring talent"}
        </p>
      </div>

      {/* ── Hero section — two-sided marketplace ── */}
      <HeroSection />

      {/* ── Stats — social proof counters (scroll-animated) ── */}
      <FadeInSection delay={100} asDiv>
        <StatsSection />
      </FadeInSection>

      {/* ── How It Works — 3-step flow (scroll-animated) ── */}
      <FadeInSection delay={200} asDiv>
        <HowItWorks />
      </FadeInSection>

      {/* ── Employer section — value props for all audiences (scroll-animated) ── */}
      <FadeInSection delay={300} asDiv>
        <EmployerSection />
      </FadeInSection>

      {/* ── Social proof — testimonials (scroll-animated) ── */}
      <FadeInSection delay={400} asDiv>
        <TestimonialCarousel persona={persona} />
      </FadeInSection>

      {/* ── Comparison table — persona-specific (scroll-animated) ── */}
      <FadeInSection delay={500} asDiv>
        <ComparisonTable persona={persona} />
      </FadeInSection>

      {/* ── Final CTA section (scroll-animated) ── */}
      <FadeInSection delay={600} asDiv>
        <section
          className="relative overflow-hidden rounded-xl p-[clamp(24px,5vw,60px)] text-center"
          style={{
            background: "var(--sh-glass-bg)",
            border: "1px solid var(--sh-glass-border)",
          }}
          aria-label="Get started"
        >
        {/* Ambient gradient */}
        <div className="shHeroGradientDramatic" aria-hidden="true" />

        <div className="relative z-[2] max-w-[640px] mx-auto">
          {persona === "company" ? (
            <>
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
                Post your first opening and get matched candidates within 48
                hours. Set up your company account in under 5 minutes.
              </p>
              <p
                className="text-xs mb-4"
                style={{ color: "var(--muted)" }}
              >
                Kuwait-based · No agency fees · Get matched in days
              </p>
            </>
          ) : (
            <>
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
                Create your free profile in under 3 minutes. No CV required —
                just your experience and what you&apos;re looking for.
                Employers are hiring right now.
              </p>
              <p
                className="text-xs mb-4"
                style={{ color: "var(--muted)" }}
              >
                Free profile creation · Connect with employers across Kuwait
              </p>
            </>
          )}
          {isLoggedIn ? (
            <Link
              href="/app"
              className="uiButton uiButton_amber uiButton_lg shGlowButton"
            >
              Open app <ChevronRight className="size-4" />
            </Link>
          ) : (
            <Link
              href={`/signup?role=${role}`}
              className="uiButton uiButton_amber uiButton_lg shGlowButton"
            >
              {persona === "company"
                ? "Set up your company account"
                : "Create your free candidate profile"}{" "}
              <ChevronRight className="size-4" />
            </Link>
          )}
        </div>
      </section>
      </FadeInSection>

      {/* ── Footer with internal role descriptions ── */}
      <footer
        className="shSection pt-6 pb-4 text-xs"
        style={{ color: "var(--muted)" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Brand */}
          <div>
            <strong className="block text-sm mb-2" style={{ color: "var(--ink)" }}>
              StudentHub
            </strong>
            <p className="leading-relaxed">
              Connecting students with the right employers. A two-sided
              marketplace for the real world of work.
            </p>
          </div>

          {/* Students */}
          <div>
            <strong className="block text-sm mb-2" style={{ color: "var(--ink)" }}>
              For students
            </strong>
            <ul className="list-none p-0 m-0 space-y-1">
              <li>
                <Link href="/signup?role=candidate" className="hover:text-[var(--ink)] transition-colors no-underline" style={{ color: "inherit" }}>
                  Create free profile
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[var(--ink)] transition-colors no-underline" style={{ color: "inherit" }}>
                  Sign in
                </Link>
              </li>
            </ul>
          </div>

          {/* Employers */}
          <div>
            <strong className="block text-sm mb-2" style={{ color: "var(--ink)" }}>
              For employers
            </strong>
            <ul className="list-none p-0 m-0 space-y-1">
              <li>
                <Link href="/signup?role=company" className="hover:text-[var(--ink)] transition-colors no-underline" style={{ color: "inherit" }}>
                  Set up company account
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[var(--ink)] transition-colors no-underline" style={{ color: "inherit" }}>
                  Sign in
                </Link>
              </li>
            </ul>
          </div>

          {/* Internal roles */}
          <div>
            <strong className="block text-sm mb-2" style={{ color: "var(--ink)" }}>
              Platform roles
            </strong>
            <ul className="list-none p-0 m-0 space-y-1.5">
              <li className="leading-relaxed">
                <span className="font-semibold" style={{ color: "var(--ink)" }}>Staff:</span>{" "}
                Tools for agencies placing candidates faster.
              </li>
              <li className="leading-relaxed">
                <span className="font-semibold" style={{ color: "var(--ink)" }}>Admin:</span>{" "}
                Compliance and operations management.
              </li>
              <li className="leading-relaxed">
                <span className="font-semibold" style={{ color: "var(--ink)" }}>Inspector:</span>{" "}
                Review and certification workflows.
              </li>
            </ul>
          </div>
        </div>

        <div
          className="flex items-center justify-between pt-4"
          style={{ borderTop: "1px solid var(--sh-glass-border)" }}
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
              href={`/signup?role=${role}`}
              className="hover:text-[var(--ink)] transition-colors no-underline"
              style={{ color: "inherit" }}
            >
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </main>
    </>
  );
}
