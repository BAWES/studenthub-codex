"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Sparkles,
  GraduationCap,
  Building2,
  CheckCircle2,
  ArrowUpRight,
  Star,
} from "lucide-react";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";
import { FeatureGrid } from "@/components/marketing";
import { TestimonialCarousel } from "@/components/marketing";
import { PricingCard } from "@/components/marketing";
import { ComparisonTable } from "@/components/marketing";
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

// ── Valid personas ────────────────────────────────────────────

const VALID_PERSONAS: SwitcherPersona[] = [
  "candidate",
  "company",
];

function parsePersona(raw: string | null): SwitcherPersona {
  if (raw && VALID_PERSONAS.includes(raw as SwitcherPersona)) {
    return raw as SwitcherPersona;
  }
  return "candidate";
}

// ── Persona → signup role mapping ─────────────────────────────

const signupRoles: Record<SwitcherPersona, string> = {
  candidate: "candidate",
  company: "company",
};

// ── Nav CTA copy ──────────────────────────────────────────────

const navCtaLabel: Record<SwitcherPersona, string> = {
  candidate: "Create free student profile",
  company: "Partner with us",
};

const finalCtaEyebrow: Record<SwitcherPersona, string> = {
  candidate: "Start building your career",
  company: "Start your partnership",
};

const finalCtaTitle: Record<SwitcherPersona, string> = {
  candidate: "Your future CV starts today.",
  company: "Workforce management, handled.",
};

const finalCtaBody: Record<SwitcherPersona, string> = {
  candidate:
    "Create your free profile in under 3 minutes. StudentHub matches you with paid placements across different companies. Rotate every ~3 months, build experience across multiple roles, and graduate way ahead of your peers. Free, always.",
  company:
    "Get matched with qualified student workers in under 48 hours. StudentHub manages placement, compliance, payroll, and rotations — one partner, one invoice. Hourly rates and monthly plans available.",
};

const finalCtaButton: Record<SwitcherPersona, string> = {
  candidate: "Create your free student profile",
  company: "Partner with StudentHub",
};

const finalCtaProof: Record<SwitcherPersona, string> = {
  candidate: "1,200+ students placed this year · 4.8★ satisfaction",
  company: "200+ companies on StudentHub · 100% audit pass rate",
};

// ── Dual-pane marketplace data ────────────────────────────────

const MARKETPLACE_STATS = [
  { value: "1,200+", label: "students placed this year" },
  { value: "200+", label: "partner companies" },
  { value: "48h", label: "avg match time" },
  { value: "4.8★", label: "satisfaction rating" },
];

const STUDENT_PANE = {
  icon: GraduationCap,
  eyebrow: "For students",
  headline: "Get paid work experience that builds your future.",
  highlight: "your future.",
  body: "Create a free profile, get matched to real job placements across multiple industries, and graduate with a CV that proves you can work. Free, always.",
  benefits: [
    "Rotate roles every ~3 months — build diverse experience",
    "Paid placements at Kuwait&apos;s top employers",
    "ID cards with QR-code compliance verification",
  ],
  cta: "Create your free profile",
  ctaHref: "/signup?role=candidate",
  proof: "Completely free for students",
};

const EMPLOYER_PANE = {
  icon: Building2,
  eyebrow: "For employers",
  headline: "Hire vetted student workers without the HR overhead.",
  highlight: "without the HR overhead.",
  body: "Get matched with pre-vetted student workers in under 48 hours. StudentHub manages placement, compliance, payroll, and rotations — one partner, one invoice.",
  benefits: [
    "Pre-vetted candidates delivered in 48 hours",
    "Full compliance, payroll, and rotation management",
    "One consolidated invoice — hourly or monthly",
  ],
  cta: "Partner with StudentHub",
  ctaHref: "/signup?role=company",
  proof: "Hourly rates and monthly plans available",
};

// ── Micro-animation hooks ─────────────────────────────────────

function useFadeInUp(delayMs: number = 0) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.style.opacity = "0";
    el.style.transform = "translateY(16px)";
    el.style.transition = `opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 600ms cubic-bezier(0.16, 1, 0.3, 1)`;

    const timeout = setTimeout(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, delayMs);

    return () => clearTimeout(timeout);
  }, [delayMs]);

  return ref;
}

// ── Marketplace Hero ──────────────────────────────────────────

function MarketplaceHero({ onPersonaChange }: { onPersonaChange: (p: SwitcherPersona) => void }) {
  const titleRef = useFadeInUp(100);
  const studentRef = useFadeInUp(350);
  const employerRef = useFadeInUp(500);
  const statsRef = useFadeInUp(700);

  return (
    <section
      className="shSection relative min-h-[min(900px,calc(100svh_-_80px))] grid content-start items-center overflow-hidden rounded-xl p-[clamp(22px,5vw,76px)] max-lg:min-h-auto max-lg:p-7"
      aria-label="StudentHub — two-sided marketplace for student employment"
    >
      {/* Animated gradient background */}
      <div className="shHeroGradientDramatic" aria-hidden="true" />

      {/* Floating ambient orbs */}
      <div className="shOrb shOrbA" aria-hidden="true" />
      <div className="shOrb shOrbB" aria-hidden="true" />
      <div className="shOrb shOrbC" aria-hidden="true" />

      {/* Particle grid overlay */}
      <div className="shParticleGrid" aria-hidden="true" />

      {/* ── Unified headline ── */}
      <div ref={titleRef} className="relative z-[2] max-w-[820px] mx-auto text-center mb-8 max-lg:mb-6">
        <p className="shHeroEyebrow mx-auto">
          <Sparkles className="size-3" />
          Kuwait&apos;s student-employer marketplace
        </p>
        <h1 className="shHeroTitle text-center max-sm:text-[clamp(32px,9vw,44px)]">
          Connect students with
          <br className="hidden sm:block" />
          {" "}
          <span className="shHeroHighlight">real work experience.</span>
        </h1>
        <p
          className="max-w-[620px] mx-auto mt-3 text-[clamp(15px,1.5vw,19px)] leading-relaxed"
          style={{ color: "var(--muted)" }}
        >
          StudentHub connects students with Kuwait-based employers for paid,
          short-term placements. Build your career. Build your workforce.
        </p>
      </div>

      {/* ── Dual CTA panes ── */}
      <div className="relative z-[2] grid grid-cols-2 gap-5 w-full max-w-[920px] mx-auto max-lg:grid-cols-1 max-lg:max-w-[500px]">
        {/* Student pane */}
        <div
          ref={studentRef}
          className="group relative rounded-xl p-[clamp(18px,3vw,32px)] transition-all duration-300 hover:-translate-y-[4px]"
          style={{
            background: "var(--sh-glass-bg)",
            border: "1px solid var(--sh-glass-border)",
          }}
        >
          {/* Hover glow */}
          <div
            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background:
                "radial-gradient(600px circle at 50% 50%, var(--sh-info-glow), transparent 70%)",
            }}
            aria-hidden="true"
          />

          <div className="relative z-[1] grid content-start gap-4">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 text-[var(--sh-info)] text-[11px] font-black uppercase tracking-wider">
              <GraduationCap className="size-4" />
              {STUDENT_PANE.eyebrow}
            </div>

            {/* Headline */}
            <h2
              className="text-[clamp(22px,2.8vw,34px)] font-extrabold leading-[1.08] tracking-tight"
              style={{ color: "var(--ink)" }}
            >
              {STUDENT_PANE.headline}
            </h2>

            {/* Body */}
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              {STUDENT_PANE.body}
            </p>

            {/* Benefits */}
            <ul className="grid gap-2 mt-1">
              {STUDENT_PANE.benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-2 text-xs font-medium leading-snug"
                  style={{ color: "var(--ink)" }}
                >
                  <CheckCircle2 className="size-4 mt-[1px] shrink-0 text-[var(--sh-success)]" />
                  {benefit}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="mt-3">
              <Link
                href={STUDENT_PANE.ctaHref}
                className="uiButton uiButton_default uiButton_lg shGlowButton w-full justify-center"
                onClick={() => onPersonaChange("candidate")}
              >
                {STUDENT_PANE.cta} <ArrowUpRight className="size-4" />
              </Link>
            </div>

            {/* Proof */}
            <p className="text-[11px] font-semibold text-center" style={{ color: "var(--sh-success)" }}>
              {STUDENT_PANE.proof}
            </p>
          </div>
        </div>

        {/* Employer pane */}
        <div
          ref={employerRef}
          className="group relative rounded-xl p-[clamp(18px,3vw,32px)] transition-all duration-300 hover:-translate-y-[4px]"
          style={{
            background: "var(--sh-glass-bg)",
            border: "1px solid var(--sh-glass-border)",
          }}
        >
          {/* Hover glow */}
          <div
            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background:
                "radial-gradient(600px circle at 50% 50%, var(--sh-info-glow), transparent 70%)",
            }}
            aria-hidden="true"
          />

          <div className="relative z-[1] grid content-start gap-4">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 text-[var(--sh-info)] text-[11px] font-black uppercase tracking-wider">
              <Building2 className="size-4" />
              {EMPLOYER_PANE.eyebrow}
            </div>

            {/* Headline */}
            <h2
              className="text-[clamp(22px,2.8vw,34px)] font-extrabold leading-[1.08] tracking-tight"
              style={{ color: "var(--ink)" }}
            >
              {EMPLOYER_PANE.headline}
            </h2>

            {/* Body */}
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              {EMPLOYER_PANE.body}
            </p>

            {/* Benefits */}
            <ul className="grid gap-2 mt-1">
              {EMPLOYER_PANE.benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-2 text-xs font-medium leading-snug"
                  style={{ color: "var(--ink)" }}
                >
                  <CheckCircle2 className="size-4 mt-[1px] shrink-0 text-[var(--sh-info)]" />
                  {benefit}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="mt-3">
              <Link
                href={EMPLOYER_PANE.ctaHref}
                className="uiButton uiButton_default uiButton_lg shGlowButton w-full justify-center"
                onClick={() => onPersonaChange("company")}
              >
                {EMPLOYER_PANE.cta} <ArrowUpRight className="size-4" />
              </Link>
            </div>

            {/* Proof */}
            <p className="text-[11px] font-semibold text-center" style={{ color: "var(--sh-info)" }}>
              {EMPLOYER_PANE.proof}
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div
        ref={statsRef}
        className="relative z-[2] grid grid-cols-4 gap-x-8 gap-y-3 w-full max-w-[720px] mx-auto mt-8 p-5 rounded-xl max-sm:grid-cols-2 max-sm:gap-4"
        style={{
          background: "var(--sh-glass-bg-strong)",
          border: "1px solid var(--sh-glass-border)",
        }}
      >
        {MARKETPLACE_STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <strong
              className="block text-[clamp(20px,2.5vw,32px)] font-black leading-none"
              style={{
                background: "linear-gradient(135deg, var(--ink), var(--blue))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {stat.value}
            </strong>
            <span
              className="block text-[11px] font-semibold mt-1 leading-tight"
              style={{ color: "var(--muted)" }}
            >
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Component ─────────────────────────────────────────────────

export default function LandingContent({ session }: LandingContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [persona, setPersona] = useState<SwitcherPersona>("candidate");

  // Sync persona from URL on mount and on change
  useEffect(() => {
    const raw = searchParams.get("persona");
    setPersona(parsePersona(raw));
  }, [searchParams]);

  // When persona changes, update the URL
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

  const role = signupRoles[persona];
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
                  href={`/signup?role=${role}`}
                  className="uiButton uiButton_default uiButton_defaultSize"
                >
                  {navCtaLabel[persona]} <Sparkles className="size-3.5" />
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

      {/* ── Two-sided marketplace hero ── */}
      <MarketplaceHero onPersonaChange={handlePersonaChange} />

      {/* ── Persona switcher — pick your role ── */}
      <PersonaSwitcher active={persona} onChange={handlePersonaChange} />

      {/* ── Feature grid — persona-specific ── */}
      <FeatureGrid persona={persona} />

      {/* ── Social proof — persona-specific testimonials ── */}
      <TestimonialCarousel persona={persona} />

      {/* ── Comparison table — persona-specific ── */}
      <ComparisonTable persona={persona} />

      {/* ── Pricing — persona-specific ── */}
      <PricingCard persona={persona} />

      {/* ── Final CTA section — persona-aware ── */}
      <section
        className="shSection relative overflow-hidden rounded-xl p-[clamp(24px,5vw,60px)] text-center"
        style={{
          background: "var(--sh-glass-bg)",
          border: "1px solid var(--sh-glass-border)",
        }}
        aria-label="Get started"
      >
        {/* Ambient gradient */}
        <div className="shHeroGradientDramatic" aria-hidden="true" />

        <div className="relative z-[2] max-w-[640px] mx-auto">
          <p className="text-[var(--sh-info)] text-[11px] font-black uppercase tracking-wider mb-2">
            {finalCtaEyebrow[persona]}
          </p>
          <h2 className="shBenefitsTitle text-center">
            {finalCtaTitle[persona]}
          </h2>
          <p
            className="max-w-[480px] mx-auto mt-2 mb-6 leading-relaxed"
            style={{ color: "var(--muted)" }}
          >
            {finalCtaBody[persona]}
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
              href={`/signup?role=${role}`}
              className="uiButton uiButton_default uiButton_lg shGlowButton"
            >
              {finalCtaButton[persona]} <ChevronRight className="size-4" />
            </Link>
          )}
          <div
            className="flex items-center justify-center gap-4 mt-4 text-xs"
            style={{ color: "var(--muted)" }}
          >
            {finalCtaProof[persona].split("·").map((part, i) => (
              <span key={i}>
                {part.trim()}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="shSection pt-4 pb-2 text-xs"
        style={{ color: "var(--muted)" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span>&copy; {new Date().getFullYear()} StudentHub. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link
              href="/for-staff"
              className="hover:text-[var(--ink)] transition-colors no-underline"
              style={{ color: "inherit" }}
            >
              For staff
            </Link>
            <Link
              href="/for-admins"
              className="hover:text-[var(--ink)] transition-colors no-underline"
              style={{ color: "inherit" }}
            >
              For admins
            </Link>
            <Link
              href="/for-inspectors"
              className="hover:text-[var(--ink)] transition-colors no-underline"
              style={{ color: "inherit" }}
            >
              For inspectors
            </Link>
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
              Sign up as {persona}
            </Link>
          </div>
        </div>
      </footer>
    </main>
    </>
  );
}
