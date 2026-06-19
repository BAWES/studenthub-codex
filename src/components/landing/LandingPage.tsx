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

const SH_BLUE = "#0b63ce";
const SH_AMBER = "#f59e0b";

interface LandingPageProps {
  session: { id: string; email: string; role: string; name: string } | null;
}

// ═══════════════════════════════════════════════════════════════
// TRUST BAR
// ═══════════════════════════════════════════════════════════════

function TrustBar() {
  return (
    <section className="shSection" aria-label="Trusted organizations">
      <div
        className="relative overflow-hidden rounded-xl p-6 sm:p-8 text-center"
        style={{
          background: "var(--sh-glass-bg)",
          border: "1px solid var(--sh-glass-border)",
        }}
      >
        <p
          className="text-center text-[11px] font-black uppercase tracking-wider mb-5"
          style={{ color: "var(--muted)" }}
        >
          Trusted by leading organizations across Kuwait
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 gap-y-3 opacity-40">
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
        "--sh-coral": SH_BLUE,
        "--sh-amber": SH_AMBER,
        "--sh-blue": SH_BLUE,
        "--sh-info": SH_BLUE,
        "--sh-coral-hover": "#0a56b0",
        "--sh-coral-glow": `0 0 12px rgba(11, 99, 206, 0.25)`,
        "--sh-amber-glow": "0 4px 14px rgba(245, 158, 11, 0.35)",
        "--success": "var(--green)",
        "--error": "var(--destructive)",
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
        className="min-h-svh w-[min(1320px,calc(100%_-_28px))] mx-auto grid content-start gap-6 pt-[18px] pb-[42px] max-sm:w-[min(calc(100%_-_20px),720px)]"
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
