"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  HeroSection,
  StatsSection,
  HowItWorks,
  EmployerSection,
  TestimonialCarousel,
  ComparisonTable,
} from "@/components/marketing";
import LandingNav, { type Persona } from "./LandingNav";
import CTASection from "./CTASection";
import LandingFooter from "./LandingFooter";
import "./landing.css";

const SH_BLUE = "#1f73b7";
const SH_CORAL = "#eb6651";

interface LandingPageProps {
  session: { id: string; email: string; role: string; name: string } | null;
}

// ═══════════════════════════════════════════════════════════════
// TRUST BAR
// ═══════════════════════════════════════════════════════════════

function TrustBar() {
  return (
    <section className="scroll-mt-20" aria-label="Trusted organizations">
      <div
        className="relative overflow-hidden rounded-xl p-6 sm:p-8 text-center"
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <p
          className="text-center text-[11px] font-bold uppercase tracking-wider mb-5"
          style={{ color: "var(--muted)" }}
        >
          Trusted by leading organizations across Kuwait
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 gap-y-3 opacity-30">
          {["Alshaya", "KIPCO", "NBK", "Zain", "Kuwait Airways", "GUST"].map((name) => (
            <span
              key={name}
              className="text-sm font-bold tracking-tight"
              style={{ color: "var(--ink)" }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════

export default function LandingPage({ session }: LandingPageProps) {
  const sp = useSearchParams();
  const router = useRouter();
  const [persona, setPersona] = useState<Persona>("candidate");

  useEffect(() => {
    setPersona(sp.get("persona") === "company" ? "company" : "candidate");
  }, [sp]);

  const handlePersonaChange = useCallback(
    (p: Persona) => {
      const params = new URLSearchParams(sp.toString());
      if (p === "candidate") params.delete("persona");
      else params.set("persona", p);
      router.replace(params.toString() ? `/?${params}` : "/", { scroll: false });
    },
    [router, sp]
  );

  return (
    <div
      style={{
        "--sh-blue": SH_BLUE,
        "--sh-amber": SH_CORAL,
        "--sh-info": SH_BLUE,
        "--sh-coral": SH_CORAL,
        "--sh-coral-hover": "#d45441",
        "--sh-coral-glow": `0 0 12px ${SH_CORAL}40`,
        "--sh-amber-glow": `0 4px 14px ${SH_CORAL}50`,
        backgroundColor: "var(--paper)",
        minHeight: "100svh",
      } as React.CSSProperties}
    >
      <a href="#main-content" className="skipLink" style={{ color: "var(--ink)" }}>
        Skip to content
      </a>
      <LandingNav
        session={session}
        persona={persona}
        onPersonaChange={handlePersonaChange}
      />

      <main
        id="main-content"
        className="min-h-svh w-[min(1320px,calc(100%_-_28px))] mx-auto grid content-start gap-8 pt-5 pb-[42px] max-sm:w-[min(calc(100%_-_20px),720px)]"
      >
        <HeroSection />

        <TrustBar />

        <StatsSection />

        <div id="how-it-works">
          <HowItWorks />
        </div>

        <div id="for-employers">
          <EmployerSection />
        </div>

        <div id="testimonials">
          <TestimonialCarousel persona={persona === "company" ? "company" : "candidate"} />
        </div>

        <div id="comparison">
          <ComparisonTable persona={persona === "company" ? "company" : "candidate"} />
        </div>

        <CTASection persona={persona} />
      </main>

      <LandingFooter persona={persona} />
    </div>
  );
}
