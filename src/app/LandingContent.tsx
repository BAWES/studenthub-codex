"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";
import { HeroSection } from "@/components/marketing";
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
  "staff",
  "admin",
  "inspector",
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
  staff: "staff",
  admin: "admin",
  inspector: "inspector",
};

// ── Nav CTA copy ──────────────────────────────────────────────

const navCtaLabel: Record<SwitcherPersona, string> = {
  candidate: "Create free candidate profile",
  company: "Set up company account",
  staff: "Request staff access",
  admin: "Request admin access",
  inspector: "Request inspector access",
};

const finalCtaEyebrow: Record<SwitcherPersona, string> = {
  candidate: "Start your placement journey",
  company: "Start hiring today",
  staff: "Start placing faster",
  admin: "Take control of operations",
  inspector: "Streamline your inspections",
};

const finalCtaTitle: Record<SwitcherPersona, string> = {
  candidate: "Your next role is one profile away.",
  company: "Your next hire is one post away.",
  staff: "Your next placement is one search away.",
  admin: "Your next dashboard is one login away.",
  inspector: "Your next batch is one review away.",
};

const finalCtaBody: Record<SwitcherPersona, string> = {
  candidate:
    "Create your free profile in under 3 minutes. No CV required — just your experience and what you're looking for. Employers are hiring right now.",
  company:
    "Post your first opening and get matched candidates within 48 hours. Set up your company account in under 5 minutes.",
  staff:
    "Start searching, shortlisting, and placing candidates immediately. Access the full staffing toolkit from day one.",
  admin:
    "Get full visibility across users, finances, compliance, and payroll. One workspace replaces a dozen logins.",
  inspector:
    "Start reviewing document batches with full audit trails. Clear your queue and maintain compliance from day one.",
};

const finalCtaButton: Record<SwitcherPersona, string> = {
  candidate: "Create your free candidate profile",
  company: "Set up your company account",
  staff: "Get staff access",
  admin: "Get admin access",
  inspector: "Get inspector access",
};

const finalCtaProof: Record<SwitcherPersona, string> = {
  candidate: "1,200+ candidates placed this year · 4.8★ satisfaction",
  company: "200+ employers hiring · 3-day avg time-to-shortlist",
  staff: "350+ agencies · 62% faster placement",
  admin: "15,000+ worker records managed · 99.7% audit pass rate",
  inspector: "10,000+ documents reviewed monthly · Full audit trails",
};

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

      {/* ── Persona switcher — pick your role ── */}
      <PersonaSwitcher active={persona} onChange={handlePersonaChange} />

      {/* ── Hero section — persona-specific ── */}
      <HeroSection persona={persona} />

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
            href={`/signup?role=${role}`}
            className="hover:text-[var(--ink)] transition-colors no-underline"
            style={{ color: "inherit" }}
          >
            Sign up as {persona}
          </Link>
        </div>
      </footer>
    </main>
    </>
  );
}
