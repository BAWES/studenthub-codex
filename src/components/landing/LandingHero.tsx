"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight, Sparkles, GraduationCap, Building2,
  Search, CheckCircle2, Zap, Shield, Clock, Users, Star,
} from "lucide-react";

// ── Scroll-reveal with staggered delay ──────────────────────────

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function RevealItem({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 600ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 600ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export interface LandingHeroProps {
  onCtaClick?: () => void;
}

export default function LandingHero({ onCtaClick }: LandingHeroProps) {
  return (
    <section
      className="relative min-h-[clamp(520px,85svh,780px)] grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] items-center overflow-hidden rounded-xl px-[clamp(22px,5vw,76px)] py-[clamp(32px,4vw,56px)] max-lg:min-h-auto max-lg:p-7 max-lg:grid-cols-1"
      aria-label="StudentHub — connecting students with the right employers"
    >
      {/* ── Background layer ── */}
      {/* Main gradient orb */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: "radial-gradient(ellipse 90% 60% at 30% -10%, color-mix(in srgb, var(--sh-coral) 14%, transparent) 0%, transparent 60%)",
        }}
      />
      {/* Secondary coral orb */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 80% 70%, color-mix(in srgb, var(--sh-coral) 10%, transparent) 0%, transparent 55%)",
        }}
      />
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.06] pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          color: "var(--ink)",
        }}
      />

      {/* ── Decorative floating orbs ── */}
      <div
        className="absolute w-[320px] h-[320px] rounded-full pointer-events-none opacity-15 dark:opacity-8 max-lg:hidden"
        aria-hidden="true"
        style={{
          background: "radial-gradient(circle, var(--sh-coral) 0%, transparent 70%)",
          top: "5%",
          right: "30%",
          filter: "blur(60px)",
          animation: "shFloat 10s ease-in-out infinite",
        }}
      />
      <div
        className="absolute w-[240px] h-[240px] rounded-full pointer-events-none opacity-12 dark:opacity-6 max-lg:hidden"
        aria-hidden="true"
        style={{
          background: "radial-gradient(circle, var(--sh-coral) 0%, transparent 70%)",
          bottom: "5%",
          left: "45%",
          filter: "blur(50px)",
          animation: "shFloat 12s ease-in-out infinite reverse",
        }}
      />

      {/* ── Left column: Copy ── */}
      <div className="relative z-[2] max-w-[620px] max-lg:max-w-none pt-10 lg:pt-6">

        {/* Eyebrow badge */}
        <RevealItem delay={0}>
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold mb-5"
            style={{
              backgroundColor: "color-mix(in srgb, var(--sh-coral) 10%, transparent)",
              color: "var(--sh-coral)",
              border: "1px solid color-mix(in srgb, var(--sh-coral) 20%, transparent)",
            }}
          >
            <Sparkles className="size-3" />
            Two-sided marketplace
          </div>
        </RevealItem>

        {/* Headline */}
        <RevealItem delay={80}>
          <h1
            className="text-[clamp(32px,5.5vw,58px)] font-bold leading-[1.08] tracking-tight mb-4"
            style={{ color: "var(--ink)" }}
          >
            <span className="block">Connecting students with</span>
            <span className="block" style={{ color: "var(--sh-coral)" }}>
              the right employers
            </span>
          </h1>
        </RevealItem>

        {/* Subhead */}
        <RevealItem delay={160}>
          <p
            className="text-[clamp(14px,1.2vw,17px)] leading-relaxed max-w-[520px] mb-6"
            style={{ color: "var(--muted)" }}
          >
            StudentHub is Kuwait&apos;s two-sided marketplace where students build careers
            and employers discover vetted talent. Our staff recruiters match you with the
            right opportunities — all in one place.
          </p>
        </RevealItem>

        {/* Dual CTAs */}
        <RevealItem delay={240}>
          <div className="flex flex-wrap items-center gap-3 max-sm:flex-col max-sm:items-stretch">
            {onCtaClick ? (
              <button
                onClick={onCtaClick}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 group"
                style={{ backgroundColor: "var(--sh-coral)" }}
              >
                <GraduationCap className="size-4" />
                Create your free profile{" "}
                <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            ) : (
              <Link
                href="/signup?role=candidate"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 group shadow-lg"
                style={{
                  backgroundColor: "var(--sh-coral)",
                  boxShadow: "var(--sh-coral-glow), 0 4px 14px color-mix(in srgb, var(--sh-coral) 30%, transparent)",
                }}
              >
                <GraduationCap className="size-4" />
                Create your free profile{" "}
                <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            )}
            <Link
              href="/signup?role=company"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 group shadow-lg"
              style={{
                background: "linear-gradient(135deg, var(--sh-amber), var(--sh-amber-deep))",
                boxShadow: "var(--sh-amber-glow)",
              }}
            >
              <Building2 className="size-4" />
              Hire students{" "}
              <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-medium no-underline transition-colors duration-150"
              style={{ color: "var(--muted)" }}
            >
              Sign in
            </Link>
          </div>
        </RevealItem>

        {/* Social proof */}
        <RevealItem delay={320}>
          <div className="flex flex-wrap items-center gap-2 mt-5">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: "color-mix(in srgb, var(--success) 10%, transparent)",
                color: "var(--success)",
              }}
            >
              <Zap className="size-3" />
              1,200+ students placed
            </span>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: "color-mix(in srgb, var(--sh-coral) 10%, transparent)",
                color: "var(--sh-coral)",
              }}
            >
              <Shield className="size-3" />
              500+ employers
            </span>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: "color-mix(in srgb, var(--sh-coral) 10%, transparent)",
                color: "var(--sh-coral)",
              }}
            >
              <Star className="size-3" />
              4.8 average rating
            </span>
          </div>
        </RevealItem>
      </div>

      {/* ── Right column: Premium mockup ── */}
      <div
        className="relative z-[2] w-full max-lg:mt-8 max-lg:max-w-lg max-lg:mx-auto"
        aria-hidden="true"
      >
        <RevealItem delay={400}>
          <div
            className="relative rounded-2xl overflow-hidden backdrop-blur-xl"
            style={{
              backgroundColor: "color-mix(in srgb, var(--surface) 65%, transparent)",
              border: "1px solid color-mix(in srgb, var(--border) 50%, transparent)",
              boxShadow: "0 12px 60px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            {/* Mockup chrome */}
            <div
              className="flex items-center gap-2 px-4 py-2.5 border-b"
              style={{ borderColor: "color-mix(in srgb, var(--border) 40%, transparent)" }}
            >
              <div className="flex gap-1.5">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: "var(--sh-coral)" }} />
                <span className="size-2.5 rounded-full" style={{ backgroundColor: "#f59e0b" }} />
                <span className="size-2.5 rounded-full" style={{ backgroundColor: "var(--success)" }} />
              </div>
              <div
                className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-md text-xs"
                style={{ backgroundColor: "color-mix(in srgb, var(--paper) 60%, transparent)", color: "var(--muted)" }}
              >
                <Search className="size-3" />
                studenthub.co
              </div>
            </div>

            {/* Mockup body */}
            <div className="p-4 sm:p-5 grid gap-3">

              {/* Search bar */}
              <div
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--surface) 70%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--border) 40%, transparent)",
                }}
              >
                <Search className="size-3.5 shrink-0" style={{ color: "var(--muted)" }} />
                <span className="text-xs" style={{ color: "var(--muted)" }}>Search open roles, companies...</span>
                <span
                  className="ml-auto text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0"
                  style={{ backgroundColor: "color-mix(in srgb, var(--surface) 80%, transparent)", color: "var(--muted)" }}
                >
                  ⌘K
                </span>
              </div>

              {/* Persona switch */}
              <div
                className="flex rounded-lg p-0.5"
                style={{ backgroundColor: "color-mix(in srgb, var(--paper) 50%, transparent)" }}
              >
                <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[7px] text-xs font-medium"
                  style={{ backgroundColor: "color-mix(in srgb, var(--sh-coral) 14%, transparent)", color: "var(--sh-coral)" }}>
                  <GraduationCap className="size-3" /> Student
                </div>
                <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[7px] text-xs font-medium"
                  style={{ color: "var(--muted)" }}>
                  <Building2 className="size-3" /> Employer
                </div>
              </div>

              {/* Matched role card */}
              <div
                className="rounded-xl p-4"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--surface) 70%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--border) 30%, transparent)",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--sh-coral)" }}>
                    <Sparkles className="size-2.5 inline-block -mt-0.5 mr-1" />
                    AI-matched for you
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: "color-mix(in srgb, var(--success) 12%, transparent)", color: "var(--success)" }}>
                    <CheckCircle2 className="size-2.5 inline-block -mt-0.5 mr-0.5" />
                    92% match
                  </span>
                </div>
                <p className="text-lg font-bold leading-none mb-0.5" style={{ color: "var(--ink)" }}>
                  senior care assistant
                </p>
                <p className="text-xs mb-2.5" style={{ color: "var(--muted)" }}>
                  12 matching roles &middot; Kuwait City &middot; KWD 3-5/hr
                </p>

                {/* Quick stats */}
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: "Profile", value: "92%", color: "var(--sh-coral)" },
                    { label: "Apps", value: "4", color: "var(--sh-coral)" },
                    { label: "Timesheet", value: "Wk 24", color: "var(--sh-coral)" },
                    { label: "Pay", value: "KWD 420", color: "var(--sh-coral)" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="py-2 rounded-lg text-center"
                      style={{ backgroundColor: "color-mix(in srgb, var(--paper) 40%, transparent)" }}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: item.color }}>
                        {item.label}
                      </p>
                      <p className="text-xs font-bold mt-0.5" style={{ color: "var(--ink)" }}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom badges */}
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full"
                  style={{ backgroundColor: "color-mix(in srgb, var(--success) 12%, transparent)", color: "var(--success)" }}
                >
                  <Users className="size-2.5" /> 500+ employers active
                </span>
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full"
                  style={{ backgroundColor: "color-mix(in srgb, var(--sh-coral) 10%, transparent)", color: "var(--sh-coral)" }}
                >
                  <Clock className="size-2.5" /> Avg match: {"<"}48h
                </span>
              </div>
            </div>
          </div>

          {/* Floating decoration */}
          <div
            className="absolute -bottom-3 -right-3 w-full h-full rounded-2xl -z-[1]"
            style={{
              backgroundColor: "color-mix(in srgb, var(--sh-coral) 6%, transparent)",
              border: "1px solid color-mix(in srgb, var(--sh-coral) 10%, transparent)",
            }}
            aria-hidden="true"
          />
        </RevealItem>
      </div>
    </section>
  );
}
