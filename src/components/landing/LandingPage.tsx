"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FadeInSection } from "@/components/marketing";
import LandingNav, { type Persona } from "./LandingNav";
import LandingHero from "./LandingHero";
import StatsCounters from "./StatsCounters";
import HowItWorksSection from "./HowItWorksSection";
import EmployerValueSection from "./EmployerValueSection";
import TestimonialsSection from "./TestimonialsSection";
import ComparisonSection from "./ComparisonSection";
import CTASection from "./CTASection";
import LandingFooter from "./LandingFooter";

interface LandingPageProps {
  session: { id: string; email: string; role: string; name: string } | null;
}

// ═══════════════════════════════════════════════════════════════
// TRUST BAR
// ═══════════════════════════════════════════════════════════════

function TrustBar() {
  return (
    <section className="py-12 sm:py-16 px-6 max-w-6xl mx-auto max-sm:px-4">
      <FadeInSection asDiv>
        <p className="text-center text-xs font-medium mb-6" style={{ color: "var(--muted)" }}>
          Trusted by leading organizations across Kuwait
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 gap-y-4 opacity-40">
          {["Alshaya", "KIPCO", "NBK", "Zain", "Kuwait Airways", "GUST"].map((name) => (
            <span
              key={name}
              className="text-sm font-semibold tracking-tight"
              style={{ color: "var(--ink)" }}
            >
              {name}
            </span>
          ))}
        </div>
      </FadeInSection>
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
        minHeight: "100svh",
        backgroundColor: "var(--paper)",
      }}
    >

      <a href="#main-content" className="skipLink" style={{ color: "var(--ink)" }}>
        Skip to content
      </a>
      <LandingNav
        session={session}
        persona={persona}
        onPersonaChange={handlePersonaChange}
      />

      <main id="main-content" className="relative">
        <LandingHero />

        <TrustBar />

        <StatsCounters />

        <HowItWorksSection forEmployer={persona === "company"} />

        {persona === "company" && <EmployerValueSection />}

        <TestimonialsSection personas={[persona]} />

        <ComparisonSection persona={persona} />

        <CTASection persona={persona} />
      </main>

      <LandingFooter persona={persona} />
    </div>
  );
}
