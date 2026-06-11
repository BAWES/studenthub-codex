"use client";

import Link from "next/link";
import {
  ArrowUpRight, Sparkles, GraduationCap, Building2,
  Search, CheckCircle2, Zap, Shield, Clock,
} from "lucide-react";

export interface LandingHeroProps {
  onCtaClick?: () => void;
}

export default function LandingHero({ onCtaClick }: LandingHeroProps) {
  return (
    <section
      className="relative min-h-[clamp(600px,90svh,820px)] grid grid-cols-1 items-center overflow-hidden rounded-xl p-[clamp(22px,5vw,76px)] max-lg:min-h-auto max-lg:p-7"
      aria-label="StudentHub — connecting students with the right employers"
    >
      {/* Gradient background orb */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% -20%, color-mix(in srgb, var(--sh-coral) 12%, transparent) 0%, transparent 60%)",
        }}
      />

      {/* Dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.05] pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          color: "var(--ink)",
        }}
      />

      {/* Floating orbs */}
      <div
        className="absolute w-[400px] h-[400px] rounded-full pointer-events-none opacity-20 dark:opacity-10 max-lg:hidden"
        aria-hidden="true"
        style={{
          background: "radial-gradient(circle, var(--sh-coral) 0%, transparent 70%)",
          top: "10%",
          right: "5%",
          filter: "blur(60px)",
          animation: "shFloat 8s ease-in-out infinite",
        }}
      />
      <div
        className="absolute w-[300px] h-[300px] rounded-full pointer-events-none opacity-15 dark:opacity-8 max-lg:hidden"
        aria-hidden="true"
        style={{
          background: "radial-gradient(circle, #2563eb 0%, transparent 70%)",
          bottom: "15%",
          right: "20%",
          filter: "blur(50px)",
          animation: "shFloat 10s ease-in-out infinite reverse",
        }}
      />

      {/* Brand badge */}
      <div
        className="absolute top-6 left-[clamp(22px,5vw,76px)] flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold z-[2]"
        style={{
          backgroundColor: "color-mix(in srgb, var(--sh-coral) 10%, transparent)",
          color: "var(--sh-coral)",
          border: "1px solid color-mix(in srgb, var(--sh-coral) 20%, transparent)",
        }}
      >
        <Sparkles className="size-3" />
        Two-sided marketplace
      </div>

      {/* Hero copy */}
      <div className="relative z-[2] max-w-[660px] max-lg:max-w-none pt-12">
        <h1
          className="text-[clamp(32px,5.5vw,58px)] font-bold leading-[1.08] tracking-tight mb-4"
          style={{ color: "var(--ink)" }}
        >
          Connecting students with{" "}
          <span style={{ color: "var(--sh-coral)" }}>
            the right employers
          </span>
        </h1>

        <p
          className="text-[clamp(14px,1.2vw,17px)] leading-relaxed max-w-[540px] mb-6"
          style={{ color: "var(--muted)" }}
        >
          StudentHub is Kuwait&apos;s platform where students build careers and employers
          discover vetted talent. Create a profile that gets seen by 500+ employers,
          or post openings and get AI-matched candidates — all in one place.
        </p>

        {/* Dual CTAs */}
        <div className="flex flex-wrap items-center gap-3 max-sm:flex-col max-sm:items-stretch">
          {onCtaClick ? (
            <button
              onClick={onCtaClick}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:brightness-110 group"
              style={{ backgroundColor: "var(--sh-coral)" }}
            >
              <GraduationCap className="size-4" />
              Create your free profile{" "}
              <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          ) : (
            <Link
              href="/signup?role=candidate"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:brightness-110 group"
              style={{ backgroundColor: "var(--sh-coral)" }}
            >
              <GraduationCap className="size-4" />
              Create your free profile{" "}
              <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          )}
          <Link
            href="/signup?role=company"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-medium transition-all group"
            style={{
              color: "var(--ink)",
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <Building2 className="size-4" />
            Hire students{" "}
            <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-medium no-underline transition-colors"
            style={{ color: "var(--muted)" }}
          >
            Sign in
          </Link>
        </div>

        {/* Social proof */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
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
              backgroundColor: "color-mix(in srgb, var(--success) 10%, transparent)",
              color: "var(--success)",
            }}
          >
            <Clock className="size-3" />
            Since 2022
          </span>
        </div>
      </div>

      {/* Floating mockup / illustration */}
      <div
        className="absolute inset-0 grid place-items-center place-content-end p-[clamp(20px,4vw,58px)] opacity-[0.92] max-lg:relative max-lg:min-h-[380px] max-lg:order-2 max-lg:p-0 max-lg:pt-[18px] pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="max-lg:w-full"
          style={{
            animation: "shFloat 6s ease-in-out infinite",
            transformOrigin: "center bottom",
          }}
        >
          <div
            className="grid grid-cols-[auto_1fr_auto] gap-3 p-3 rounded-2xl backdrop-blur-xl max-lg:grid-cols-1 max-lg:max-w-md max-lg:mx-auto"
            style={{
              backgroundColor: "color-mix(in srgb, var(--surface) 70%, transparent)",
              border: "1px solid color-mix(in srgb, var(--border) 60%, transparent)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            {/* Left rail - student nav */}
            <div className="grid content-start gap-1.5 p-2.5 rounded-xl" style={{ backgroundColor: "color-mix(in srgb, var(--surface) 60%, transparent)", minWidth: 120 }}>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1" style={{ color: "var(--sh-coral)" }}>Student</span>
              {["Search", "Matches", "Applications", "Money"].map((item, i) => (
                <span
                  key={item}
                  className="min-h-8 flex items-center rounded-[7px] px-2.5 text-xs font-semibold"
                  style={{
                    backgroundColor: i === 0 ? "color-mix(in srgb, var(--sh-coral) 12%, transparent)" : "transparent",
                    color: i === 0 ? "var(--sh-coral)" : "var(--muted)",
                  }}
                >
                  {item}
                </span>
              ))}
              <span className="h-px my-1" style={{ backgroundColor: "var(--border)" }} />
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1" style={{ color: "var(--muted)" }}>Employer</span>
              {["Post Job", "Candidates", "Timesheets"].map((item) => (
                <span key={`emp-${item}`} className="min-h-8 flex items-center rounded-[7px] px-2.5 text-xs font-semibold" style={{ color: "var(--muted)" }}>
                  {item}
                </span>
              ))}
            </div>

            {/* Center panel */}
            <div className="grid content-start gap-2.5 p-3.5 rounded-xl min-w-[260px] max-lg:min-w-0" style={{ backgroundColor: "color-mix(in srgb, var(--surface) 60%, transparent)" }}>
              <div className="min-h-[36px] flex items-center gap-2 rounded-lg px-3" style={{ backgroundColor: "color-mix(in srgb, var(--surface) 80%, transparent)", border: "1px solid var(--border)" }}>
                <Search className="size-3.5 shrink-0" style={{ color: "var(--muted)" }} />
                <span className="text-xs" style={{ color: "var(--muted)" }}>Search open roles, companies...</span>
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: "var(--surface)", color: "var(--muted)" }}>⌘K</span>
              </div>

              <div className="grid content-start gap-1.5 rounded-lg p-[14px]" style={{ backgroundColor: "color-mix(in srgb, var(--surface) 80%, transparent)", border: "1px solid var(--border)" }}>
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--sh-coral)" }}>Matched roles</span>
                <strong className="text-[clamp(32px,5vw,56px)] leading-[0.88] block" style={{ color: "var(--ink)" }}>
                  senior care assistant
                </strong>
                <small style={{ color: "var(--muted)" }}>
                  12 matching roles · Kuwait City · KWD 3-5/hr · Starts ASAP
                </small>
                <div className="flex gap-2 mt-1.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--success) 12%, transparent)", color: "var(--success)" }}>
                    <CheckCircle2 className="size-3" /> Profile ready
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--sh-coral) 12%, transparent)", color: "var(--sh-coral)" }}>
                    <CheckCircle2 className="size-3" /> 3 saved roles
                  </span>
                </div>
              </div>

              {/* Quick stats cards */}
              <div className="grid grid-cols-4 gap-2 max-sm:grid-cols-2">
                {[
                  { label: "Profile", value: "92%" },
                  { label: "Applications", value: "4 pend." },
                  { label: "Timesheet", value: "Week 24" },
                  { label: "Payment", value: "KWD 420" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="min-h-[72px] grid content-between rounded-lg p-2.5"
                    style={{ backgroundColor: "color-mix(in srgb, var(--surface) 50%, transparent)", border: "1px solid var(--border)" }}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--sh-coral)" }}>{item.label}</span>
                    <strong className="text-sm" style={{ color: "var(--ink)" }}>{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Right panel */}
            <div className="grid content-start gap-2.5 p-3.5 rounded-xl max-lg:hidden" style={{ backgroundColor: "color-mix(in srgb, var(--surface) 60%, transparent)", minWidth: 160 }}>
              <div className="grid content-end gap-2 rounded-lg p-[14px] min-h-[120px]" style={{ backgroundColor: "color-mix(in srgb, var(--surface) 80%, transparent)", border: "1px solid var(--border)" }}>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--sh-coral)" }}>Action</span>
                <strong className="text-[16px] leading-[1.1]" style={{ color: "var(--ink)" }}>Apply to 3 matching roles</strong>
                <small style={{ color: "var(--muted)" }}>Your profile matches these positions. One click sends your CV.</small>
              </div>
              <div className="grid content-between rounded-lg p-[14px] min-h-[80px]" style={{ backgroundColor: "color-mix(in srgb, var(--surface) 50%, transparent)", border: "1px solid var(--border)" }}>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--sh-coral)" }}>Preview</span>
                <div className="flex items-center gap-2">
                  <span className="size-5 rounded-full flex items-center justify-center" style={{ backgroundColor: "color-mix(in srgb, var(--success) 15%, transparent)" }}>
                    <CheckCircle2 className="size-3" style={{ color: "var(--success)" }} />
                  </span>
                  <span className="text-xs" style={{ color: "var(--ink)" }}>3 matches ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
