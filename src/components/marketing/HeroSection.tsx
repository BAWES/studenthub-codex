"use client";

import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Search, Sparkles, GraduationCap, Building2, Zap, Shield, Clock } from "lucide-react";

// ── Two-sided marketplace hero ─────────────────────────────────

interface HeroContent {
  eyebrow: string;
  headlineParts: string[];
  highlight: string;
  body: string;
  studentCta: string;
  studentCtaHref: string;
  employerCta: string;
  employerCtaHref: string;
  proof: string;
  studentPills: string[];
  employerPills: string[];
  mockupSearch: string;
  mockupResultName: string;
  mockupResultDetail: string;
  mockupBadges: { label: string; variant: "success" | "info" }[];
  mockupActions: { label: string; status: string }[];
  mockupCommand: string;
  mockupCommandBody: string;
}

const heroContent: HeroContent = {
  eyebrow: "Two-sided marketplace for student talent",
  headlineParts: ["Connecting students with", "the right employers"],
  highlight: "the right employers",
  body: "StudentHub is the platform where students build careers and employers discover vetted talent. Create a profile that gets seen by 500+ employers, or post openings and get AI-matched candidates — all in one platform, built for Kuwait.",
  studentCta: "Create your free profile",
  studentCtaHref: "/signup?role=candidate",
  employerCta: "Hire students",
  employerCtaHref: "/signup?role=company",
  proof: "Connecting students with 500+ employers across Kuwait · No agency fees",
  studentPills: [
    "Profile visible to employers across Kuwait",
    "One-tap timesheets and payments",
    "AI-matched role suggestions",
  ],
  employerPills: [
    "AI-matched candidate suggestions",
    "Real-time timesheet approvals",
    "Consolidated monthly invoicing",
  ],
  mockupSearch: "Search open roles, companies, locations...",
  mockupResultName: "senior care assistant",
  mockupResultDetail: "12 matching roles · Kuwait City · KWD 3-5/hr · starts ASAP",
  mockupBadges: [
    { label: "Profile ready", variant: "success" },
    { label: "3 saved roles", variant: "info" },
  ],
  mockupActions: [
    { label: "Profile", status: "92% complete" },
    { label: "Applications", status: "4 pending" },
    { label: "Timesheet", status: "This week" },
    { label: "Payment", status: "KWD 420" },
  ],
  mockupCommand: "Apply to 3 matching roles",
  mockupCommandBody: "Your profile matches these open positions. One click sends your CV.",
};

// ── Quick stats row ────────────────────────────────────────────

const quickStats = [
  { icon: Zap, label: "48h avg time-to-match", value: "1,200+" },
  { icon: Shield, label: "Pre-vetted candidates", value: "99.7%" },
  { icon: Clock, label: "Years serving Kuwait", value: "Since 2022" },
];

// ── Props ──────────────────────────────────────────────────────

export interface HeroSectionProps {
  onCtaClick?: () => void;
}

// ── Component ──────────────────────────────────────────────────

export default function HeroSection({ onCtaClick }: HeroSectionProps) {
  const content = heroContent;

  // Renders the headline as separate lines to avoid literal <br /> text
  const renderHeadline = () => {
    const parts = content.headlineParts;
    return parts.map((part, i) => {
      const isLast = i === parts.length - 1;
      return (
        <span key={i} className="block">
          {isLast ? (
            <>
              {part.replace(content.highlight, "")}
              <span className="shHeroHighlight">{content.highlight}</span>
            </>
          ) : (
            part
          )}
        </span>
      );
    });
  };

  return (
    <section
      className="shSection relative min-h-[min(780px,calc(100svh_-_96px))] grid grid-cols-1 items-center overflow-hidden rounded-xl p-[clamp(22px,5vw,76px)] max-lg:min-h-auto max-lg:p-7"
      aria-label="StudentHub — connecting students with the right employers"
    >
      {/* Animated gradient background */}
      <div className="shHeroGradientDramatic" aria-hidden="true" />

      {/* Ambient glow behind mockup */}
      <div className="shHeroAmbientGlow" aria-hidden="true" />

      {/* Dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          color: "var(--ink)",
        }}
      />

      {/* Floating ambient orbs */}
      <div className="shOrb shOrbA" aria-hidden="true" />
      <div className="shOrb shOrbB" aria-hidden="true" />
      <div className="shOrb shOrbC" aria-hidden="true" />

      {/* Particle grid overlay */}
      <div className="shParticleGrid" aria-hidden="true" />

      {/* Brand badge */}
      <div className="shPersonaBadge" aria-hidden="true">
        <Sparkles className="size-3" />
        Two-sided marketplace
      </div>

      {/* Floating app mockup */}
      <div
        className="absolute inset-0 grid place-items-center place-content-end p-[clamp(20px,4vw,58px)] opacity-[0.92] max-lg:relative max-lg:min-h-[400px] max-lg:order-2 max-lg:p-0 max-lg:pt-[18px]"
        aria-hidden="true"
      >
        <div
          className="shMockupDramatic"
          style={{
            animation: "shFloat 6s ease-in-out infinite",
          }}
        >
          {/* Left rail — navigation */}
          <div className="grid content-start gap-2 p-2.5 rounded-xl bg-[var(--sh-glass-bg)]">
            {["Search", "Matches", "Applications", "Money"].map((item, i) => (
              <span
                key={item}
                className="min-h-9 flex items-center rounded-[7px] px-2.5 text-xs font-black max-sm:justify-center max-sm:px-1.5 transition-all duration-200"
                style={{
                  background:
                    i === 0
                      ? "var(--sh-info-bg)"
                      : "transparent",
                  color:
                    i === 0
                      ? "var(--sh-info)"
                      : "var(--muted)",
                  transform: i === 0 ? "scale(1.02)" : "none",
                }}
              >
                {item}
              </span>
            ))}
            <span
              className="min-h-9 flex items-center rounded-[7px] px-2.5 text-xs font-black max-sm:justify-center max-sm:px-1.5 transition-all duration-200"
              style={{
                color: "var(--muted)",
                borderTop: "1px solid var(--sh-glass-border)",
                paddingTop: 12,
                marginTop: 4,
              }}
            >
              <Building2 className="size-3 mr-2 shrink-0" />
              Employer
            </span>
            {["Post Job", "Candidates", "Timesheets", "Invoices"].map((item, i) => (
              <span
                key={`emp-${item}`}
                className="min-h-9 flex items-center rounded-[7px] px-2.5 text-xs font-black max-sm:justify-center max-sm:px-1.5 transition-all duration-200 hover:bg-[var(--sh-glass-bg-strong)]"
                style={{ color: "var(--muted)" }}
              >
                {item}
              </span>
            ))}
          </div>

          {/* Center — main panel */}
          <div className="grid content-start gap-2.5 p-3.5 rounded-xl bg-[var(--sh-glass-bg)]">
            {/* Search bar */}
            <div
              className="min-h-[40px] flex items-center gap-2 rounded-lg px-3 bg-[var(--sh-glass-bg-strong)]"
              style={{ border: "1px solid var(--sh-glass-border)" }}
            >
              <Search className="size-3.5 text-[var(--muted)] shrink-0" />
              <span className="text-xs text-[var(--muted)]">
                {content.mockupSearch}
              </span>
              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-[var(--sh-glass-bg)] text-[var(--muted)] font-mono">
                ⌘K
              </span>
            </div>

            {/* Results panel */}
            <div
              className="min-h-[190px] grid content-start gap-1.5 rounded-lg p-[14px]"
              style={{
                background: "var(--sh-glass-bg-strong)",
                border: "1px solid var(--sh-glass-border)",
              }}
            >
              <span className="text-[var(--sh-info)] text-[11px] font-black uppercase tracking-wider">
                Matched roles
              </span>
              <strong
                className="text-[clamp(42px,6vw,76px)] leading-[0.88] block"
                style={{ color: "var(--ink)" }}
              >
                {content.mockupResultName}
              </strong>
              <small style={{ color: "var(--muted)" }}>
                {content.mockupResultDetail}
              </small>
              <div className="flex gap-2 mt-1.5">
                {content.mockupBadges.map((badge) => (
                  <span
                    key={badge.label}
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full transition-all duration-200 hover:scale-105 ${
                      badge.variant === "success"
                        ? "bg-[var(--sh-success-bg)] text-[var(--sh-success)]"
                        : "bg-[var(--sh-info-bg)] text-[var(--sh-info)]"
                    }`}
                  >
                    <CheckCircle2 className="size-3" />
                    {badge.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Action cards */}
            <div className="grid grid-cols-4 gap-2 max-sm:grid-cols-1">
              {content.mockupActions.map((item, i) => (
                <div
                  key={item.label}
                  className="min-h-[92px] grid content-between rounded-lg p-3 bg-[var(--sh-glass-bg)] transition-all duration-200 hover:bg-[var(--sh-glass-bg-strong)] hover:-translate-y-0.5"
                  style={{
                    border: "1px solid var(--sh-glass-border)",
                    animationDelay: `${i * 80}ms`,
                  }}
                >
                  <span className="text-[var(--sh-info)] text-[10px] font-black uppercase tracking-wider">
                    {item.label}
                  </span>
                  <strong className="text-lg" style={{ color: "var(--ink)" }}>
                    {item.status}
                  </strong>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel — command detail */}
          <div className="grid content-start gap-2.5 p-3.5 rounded-xl bg-[var(--sh-glass-bg)] max-lg:hidden">
            <div
              className="min-h-[140px] grid content-end gap-2 rounded-lg p-[14px]"
              style={{
                background: "var(--sh-glass-bg-strong)",
                border: "1px solid var(--sh-glass-border)",
              }}
            >
              <span className="text-[var(--sh-info)] text-[10px] font-black uppercase tracking-wider">
                Action
              </span>
              <strong className="text-[18px] leading-[1.1]" style={{ color: "var(--ink)" }}>
                {content.mockupCommand}
              </strong>
              <small style={{ color: "var(--muted)" }}>
                {content.mockupCommandBody}
              </small>
            </div>
            <div
              className="min-h-[100px] grid content-between rounded-lg p-[14px] transition-all duration-200 hover:bg-[var(--sh-glass-bg-strong)]"
              style={{
                background: "var(--sh-glass-bg)",
                border: "1px solid var(--sh-glass-border)",
              }}
            >
              <span className="text-[var(--sh-info)] text-[10px] font-black uppercase tracking-wider">
                Preview
              </span>
              <div className="flex items-center gap-2">
                <span className="size-6 rounded-full bg-[var(--sh-success-bg)] flex items-center justify-center">
                  <CheckCircle2 className="size-3.5 text-[var(--sh-success)]" />
                </span>
                <span className="text-xs text-[var(--ink)]">
                  3 matching roles ready to apply
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero copy — two-sided marketplace */}
      <div className="relative z-[2] max-w-[690px] max-lg:max-w-none">
        <p className="shHeroEyebrow">
          <Sparkles className="size-3" />
          {content.eyebrow}
        </p>
        <h1 className="shHeroTitle">
          {renderHeadline()}
        </h1>
        <p className="shHeroBody">{content.body}</p>

        {/* Two CTAs — students + employers */}
        <div className="flex flex-wrap items-center gap-3.5 mt-4 max-sm:flex-col max-sm:items-stretch">
          {onCtaClick ? (
            <button
              onClick={onCtaClick}
              className="uiButton uiButton_default uiButton_lg shGlowButton group"
            >
              <GraduationCap className="size-4" />
              {content.studentCta} <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          ) : (
            <Link
              href={content.studentCtaHref}
              className="uiButton uiButton_default uiButton_lg shGlowButton group"
            >
              <GraduationCap className="size-4" />
              {content.studentCta} <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          )}
          <Link
            href={content.employerCtaHref}
            className="uiButton uiButton_amber uiButton_lg group"
          >
            <Building2 className="size-4" />
            {content.employerCta} <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <Link
            href="/login"
            className="uiButton uiButton_ghost uiButton_lg"
          >
            Sign in
          </Link>
        </div>

        {/* Social proof */}
        <div className="flex flex-wrap items-center gap-2 mt-[18px]">
          <span className="shProofPill">{content.proof}</span>
        </div>

        {/* Feature pills — students row */}
        <div className="mt-3">
          <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--muted)" }}>
            For students
          </span>
          <div className="flex flex-wrap gap-2 mt-1.5" aria-label="Key benefits for students">
            {content.studentPills.map((pill) => (
              <span key={pill} className="shHeroPill hover:bg-[var(--sh-glass-bg-strong)] transition-all duration-200">
                <GraduationCap className="size-3" />
                {pill}
              </span>
            ))}
          </div>
        </div>

        {/* Feature pills — employers row */}
        <div className="mt-2.5">
          <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--muted)" }}>
            For employers
          </span>
          <div className="flex flex-wrap gap-2 mt-1.5" aria-label="Key benefits for employers">
            {content.employerPills.map((pill) => (
              <span key={pill} className="shHeroPill hover:bg-[var(--sh-glass-bg-strong)] transition-all duration-200">
                <Building2 className="size-3" />
                {pill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
