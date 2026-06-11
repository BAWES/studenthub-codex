"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight, Sparkles, GraduationCap, Building2, Search, Check,
  Star, Users, Briefcase, Award, Target, ArrowUpRight,
  Menu, X, ChevronRight, Zap, Shield
} from "lucide-react";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";
import {
  HeroSection,
  StatsSection,
  HowItWorks,
  EmployerSection,
  TestimonialCarousel,
  ComparisonTable,
  PersonaSwitcher,
  FadeInSection,
} from "@/components/marketing";

type Persona = "candidate" | "company";

interface LandingContentProps {
  session: { id: string; email: string; role: string; name: string } | null;
}

// ═══════════════════════════════════════════════════════════════
// NAV — brand glass nav with persona tabs
// ═══════════════════════════════════════════════════════════════

function Nav({ session, persona }: { session: any; persona: Persona }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const sp = useSearchParams();

  const setPersona = useCallback((p: Persona) => {
    const params = new URLSearchParams(sp.toString());
    if (p === "candidate") params.delete("persona"); else params.set("persona", p);
    router.replace(params.toString() ? `/?${params}` : "/", { scroll: false });
  }, [router, sp]);

  const tabs = [
    { value: "candidate" as Persona, label: "Candidate", icon: GraduationCap },
    { value: "company" as Persona, label: "Company", icon: Building2 },
  ];

  return (
    <nav
      className="shGlassNav sticky top-0 z-50"
      aria-label="StudentHub public navigation"
    >
      <div className="shGlassNavInner max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2.5 no-underline shrink-0">
            <span
              className="w-8 h-8 flex items-center justify-center rounded-md text-[11px] font-bold text-white"
              style={{ background: "linear-gradient(135deg, var(--sh-info), #2563eb)" }}
            >
              SH
            </span>
            <span className="font-semibold text-sm" style={{ color: "var(--ink)" }}>
              StudentHub
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1 ml-8 max-sm:hidden">
            <Link
              href="#how-it-works"
              className="px-3 py-1.5 rounded-md text-sm no-underline hover:no-underline transition-colors"
              style={{ color: "var(--muted)" }}
              onMouseOver={e => e.currentTarget.style.color = "var(--ink)"}
              onMouseOut={e => e.currentTarget.style.color = "var(--muted)"}
            >
              How it works
            </Link>
            {persona === "company" && (
              <Link
                href="#for-employers"
                className="px-3 py-1.5 rounded-md text-sm no-underline hover:no-underline transition-colors"
                style={{ color: "var(--muted)" }}
                onMouseOver={e => e.currentTarget.style.color = "var(--ink)"}
                onMouseOut={e => e.currentTarget.style.color = "var(--muted)"}
              >
                For employers
              </Link>
            )}
            <Link
              href="#testimonials"
              className="px-3 py-1.5 rounded-md text-sm no-underline hover:no-underline transition-colors"
              style={{ color: "var(--muted)" }}
              onMouseOver={e => e.currentTarget.style.color = "var(--ink)"}
              onMouseOut={e => e.currentTarget.style.color = "var(--muted)"}
            >
              Testimonials
            </Link>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <ThemeToggle />
            {session ? (
              <Link
                href="/app"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium no-underline text-white transition-all hover:brightness-110"
                style={{ background: "linear-gradient(135deg, var(--sh-info), #1d4ed8)" }}
              >
                Open app <ArrowRight className="size-3.5" />
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden sm:inline-flex px-3 py-2 rounded-lg text-sm no-underline" style={{ color: "var(--muted)" }}>Sign in</Link>
                <Link
                  href={`/signup?role=${persona === "company" ? "company" : "candidate"}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium no-underline text-white transition-all hover:brightness-110 shGlowButton"
                  style={{ background: "linear-gradient(135deg, var(--sh-info), #1d4ed8)" }}
                >
                  {persona === "company" ? "Set up company account" : "Create free candidate profile"}
                  <ArrowRight className="size-3.5" />
                </Link>
              </>
            )}
            <button onClick={() => setOpen(!open)} className="md:hidden p-1.5 rounded-md" style={{ color: "var(--ink)" }}>
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-0 -mb-px">
          {tabs.map(tab => {
            const active = persona === tab.value;
            return (
              <button key={tab.value} onClick={() => setPersona(tab.value)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer"
                style={{
                  color: active ? "var(--sh-info)" : "var(--muted)",
                  borderBottomColor: active ? "var(--sh-info)" : "transparent",
                  backgroundColor: active ? "var(--sh-info-bg)" : "transparent",
                  borderTopLeftRadius: "8px",
                  borderTopRightRadius: "8px",
                  marginBottom: "-1px",
                }}>
                <tab.icon className="size-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {open && (
          <div className="md:hidden pb-3 space-y-1" style={{ borderTop: "1px solid var(--sh-glass-border)" }}>
            <Link href="#how-it-works" className="block px-3 py-2 rounded-md text-sm no-underline" style={{ color: "var(--muted)" }}>How it works</Link>
            <Link href="#for-employers" className="block px-3 py-2 rounded-md text-sm no-underline" style={{ color: "var(--muted)" }}>For employers</Link>
            <Link href="#testimonials" className="block px-3 py-2 rounded-md text-sm no-underline" style={{ color: "var(--muted)" }}>Testimonials</Link>
          </div>
        )}
      </div>
    </nav>
  );
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
          {["Alshaya", "KIPCO", "NBK", "Zain", "Kuwait Airways", "GUST"].map(name => (
            <span key={name} className="text-sm font-semibold" style={{ color: "var(--ink)" }}>{name}</span>
          ))}
        </div>
      </FadeInSection>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// CTA — final call to action
// ═══════════════════════════════════════════════════════════════

function CTA({ persona }: { persona: Persona }) {
  return (
    <section className="py-16 sm:py-20 px-6 max-w-6xl mx-auto max-sm:px-4">
      <FadeInSection asDiv>
        <div className="relative overflow-hidden rounded-xl p-10 sm:p-12 text-center shCardGlow"
          style={{
            background: "var(--sh-glass-bg)",
            border: "1px solid var(--sh-glass-border)",
          }}>
          <div
            className="shHeroGradientDramatic"
            aria-hidden="true"
          />
          <p className="text-[11px] font-black uppercase tracking-wider mb-2 relative z-[1]" style={{ color: "var(--sh-info)" }}>
            {persona === "company" ? "Start hiring today" : "Start your journey"}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold mb-2 relative z-[1]" style={{ color: "var(--ink)" }}>
            {persona === "company" ? "Your next hire is one post away." : "Your next role is one profile away."}
          </h2>
          <p className="text-sm mb-6 relative z-[1]" style={{ color: "var(--muted)" }}>
            {persona === "company"
              ? "Set up in under 5 minutes and get matched with vetted candidates."
              : "Create your free profile in 3 minutes. No CV required."}
          </p>
          <Link
            href={persona === "company" ? "/signup?role=company" : "/signup?role=candidate"}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-medium no-underline text-white transition-all hover:brightness-110 relative z-[1] shGlowButton"
            style={{ background: "linear-gradient(135deg, var(--sh-info), #1d4ed8)" }}
          >
            {persona === "company" ? "Set up company account" : "Create your free profile"} <ChevronRight className="size-3.5" />
          </Link>
          <p className="text-xs mt-3 relative z-[1]" style={{ color: "var(--muted)" }}>
            {persona === "company" ? "No agency fees · AI-matched" : "Free · 3 minutes"}
          </p>
        </div>
      </FadeInSection>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// FOOTER — with internal role descriptions
// ═══════════════════════════════════════════════════════════════

function Footer({ persona }: { persona: Persona }) {
  const role = persona === "company" ? "company" : "candidate";
  return (
    <footer className="border-t" style={{ borderColor: "var(--sh-glass-border)" }}>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 flex items-center justify-center rounded text-[10px] font-bold text-white"
                style={{ background: "linear-gradient(135deg, var(--sh-info), #2563eb)" }}>SH</span>
              <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>StudentHub</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
              Connecting students with the right employers. Kuwait&apos;s platform for student placement.
            </p>
          </div>
          {[
            { t: "For students", links: ["Create profile", "Sign in"] },
            { t: "For employers", links: ["Set up account", "Sign in"] },
            {
              t: "Internal roles",
              descs: [
                "Staff: Tools for agencies placing candidates faster.",
                "Admin: Compliance and operations management.",
                "Inspector: Review and certification workflows.",
              ],
            },
          ].map(c => {
            const cAny = c as any;
            if (cAny.descs) {
              return (
                <div key={cAny.t}>
                  <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted)" }}>{cAny.t}</p>
                  {cAny.descs.map((d: string) => (
                    <p key={d} className="text-xs mb-2 leading-relaxed" style={{ color: "var(--muted)" }}>{d}</p>
                  ))}
                </div>
              );
            }
            return (
              <div key={cAny.t}>
                <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted)" }}>{cAny.t}</p>
                {cAny.links.map((l: string) => <p key={l} className="text-xs mb-2" style={{ color: "var(--muted)" }}>{l}</p>)}
              </div>
            );
          })}
        </div>
        <div className="mt-8 pt-5 flex items-center justify-between border-t" style={{ borderColor: "var(--sh-glass-border)" }}>
          <p className="text-xs" style={{ color: "var(--muted)" }}>&copy; {new Date().getFullYear()} StudentHub</p>
          <div className="flex gap-4">
            <Link href="/login" className="text-xs no-underline" style={{ color: "var(--muted)" }}>Sign in</Link>
            <Link href={`/signup?role=${role}`} className="text-xs no-underline font-medium" style={{ color: "var(--muted)" }}>Sign up</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════

export default function LandingContent({ session }: LandingContentProps) {
  const sp = useSearchParams();
  const router = useRouter();
  const [persona, setPersona] = useState<Persona>("candidate");

  useEffect(() => { setPersona(sp.get("persona") === "company" ? "company" : "candidate"); }, [sp]);

  const handlePersonaChange = useCallback((p: Persona) => {
    const params = new URLSearchParams(sp.toString());
    if (p === "candidate") params.delete("persona"); else params.set("persona", p);
    router.replace(params.toString() ? `/?${params}` : "/", { scroll: false });
  }, [router, sp]);

  return (
    <div style={{ backgroundColor: "var(--paper)", minHeight: "100svh" }}>
      <a href="#main-content" className="skipLink" style={{ color: "var(--ink)" }}>Skip to content</a>
      <Nav session={session} persona={persona} />

      <main id="main-content" className="max-sm:mx-auto max-sm:px-4">
        <HeroSection />

        <TrustBar />

        <div className="space-y-4 sm:space-y-0">
          <StatsSection />

          <section
            id="how-it-works"
            className="py-12 sm:py-16 max-sm:px-2"
          >
            <div className="mb-4">
              <PersonaSwitcher active={persona} onChange={handlePersonaChange} />
            </div>
            <HowItWorks />
          </section>

          {persona === "company" && (
            <EmployerSection />
          )}

          <TestimonialCarousel persona={persona === "company" ? "company" : "candidate"} />

          <ComparisonTable persona={persona} />
        </div>

        <CTA persona={persona} />
      </main>

      <Footer persona={persona} />
    </div>
  );
}

export type { LandingContentProps };
