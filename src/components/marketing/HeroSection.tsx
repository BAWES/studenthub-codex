"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  GraduationCap,
  Building2,
  Search,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

// ── Two-sided marketplace hero ─────────────────────────────────

const SH_BLUE = "#0b63ce";
const SH_AMBER = "#f59e0b";

const heroContent = {
  eyebrow: "Two-sided marketplace for student talent",
  headline: "Connecting students with the right employers",
  subhead:
    "The platform where students build careers and employers discover vetted talent. Staff recruiters match both sides — no algorithm guessing.",
  studentCta: "Create your free profile",
  studentCtaHref: "/signup?role=candidate",
  employerCta: "Hire students",
  employerCtaHref: "/signup?role=company",
  proof: "9,500+ placements · 500+ employers · 4.8★ platform rating",
  studentBenefits: [
    "Profile visible to employers across Kuwait",
    "Staff-matched role suggestions",
    "One-tap timesheets and payments",
  ],
  employerBenefits: [
    "Staff-matched candidate suggestions",
    "Real-time timesheet approvals",
    "Consolidated monthly invoicing",
  ],
};

// ── Props ──────────────────────────────────────────────────────

export interface HeroSectionProps {
  onCtaClick?: () => void;
}

// ── Component ──────────────────────────────────────────────────

export default function HeroSection({ onCtaClick }: HeroSectionProps) {
  const content = heroContent;

  return (
    <section
      className="relative overflow-hidden rounded-2xl min-h-[min(700px,calc(100svh_-_90px))] grid grid-cols-1 lg:grid-cols-[1fr_440px] items-center gap-0"
      aria-label="StudentHub — connecting students with the right employers"
      style={{ backgroundColor: "var(--surface)" }}
    >
      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          color: "var(--ink)",
        }}
      />

      {/* Ambient glow */}
      <div
        className="absolute -top-32 -left-32 size-96 rounded-full opacity-[0.04] pointer-events-none"
        aria-hidden="true"
        style={{
          background: `radial-gradient(circle, ${SH_BLUE}, transparent 70%)`,
        }}
      />

      {/* ── Left Column: Copy ─────────────────────────────── */}
      <div className="relative z-[2] p-[clamp(28px,5vw,60px)] max-lg:pb-0">
        {/* Eyebrow badge */}
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide mb-5"
          style={{
            color: SH_BLUE,
            backgroundColor: `${SH_BLUE}15`,
          }}
        >
          <Sparkles className="size-3" />
          {content.eyebrow}
        </div>

        {/* Headline */}
        <h1
          className="text-[clamp(32px,5vw,56px)] font-bold leading-[1.05] tracking-tight mb-4"
          style={{ color: "var(--ink)" }}
        >
          {content.headline}
        </h1>

        {/* Subhead */}
        <p
          className="text-[clamp(15px,1.6vw,17px)] leading-relaxed max-w-[540px] mb-6"
          style={{ color: "var(--muted)" }}
        >
          {content.subhead}
        </p>

        {/* Two CTAs */}
        <div className="flex flex-wrap items-center gap-3 max-sm:flex-col max-sm:items-stretch mb-5">
          {onCtaClick ? (
            <button
              onClick={onCtaClick}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 group"
              style={{
                backgroundColor: SH_BLUE,
                boxShadow: `0 4px 14px ${SH_BLUE}40`,
              }}
            >
              <GraduationCap className="size-4" />
              {content.studentCta}{" "}
              <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          ) : (
            <Link
              href={content.studentCtaHref}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 group"
              style={{
                backgroundColor: SH_BLUE,
                boxShadow: `0 4px 14px ${SH_BLUE}40`,
              }}
            >
              <GraduationCap className="size-4" />
              {content.studentCta}{" "}
              <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          )}
          <Link
            href={content.employerCtaHref}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 group"
            style={{
              backgroundColor: SH_AMBER,
              boxShadow: `0 4px 14px ${SH_AMBER}50`,
            }}
          >
            <Building2 className="size-4" />
            {content.employerCta}{" "}
            <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-[var(--accent)]"
            style={{ color: "var(--muted)" }}
          >
            Sign in
          </Link>
        </div>

        {/* Social proof */}
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium mb-5"
          style={{
            color: "var(--muted)",
            backgroundColor: "var(--secondary)",
          }}
        >
          <Sparkles className="size-3" style={{ color: SH_AMBER }} />
          {content.proof}
        </div>

        {/* Benefits rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
          <div>
            <span
              className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block"
              style={{ color: SH_BLUE }}
            >
              For students
            </span>
            {content.studentBenefits.map((b) => (
              <div key={b} className="flex items-center gap-1.5 py-0.5">
                <CheckCircle2 className="size-3 shrink-0" style={{ color: "var(--green)" }} />
                <span className="text-xs" style={{ color: "var(--muted)" }}>
                  {b}
                </span>
              </div>
            ))}
          </div>
          <div>
            <span
              className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block"
              style={{ color: SH_AMBER }}
            >
              For employers
            </span>
            {content.employerBenefits.map((b) => (
              <div key={b} className="flex items-center gap-1.5 py-0.5">
                <CheckCircle2 className="size-3 shrink-0" style={{ color: "var(--green)" }} />
                <span className="text-xs" style={{ color: "var(--muted)" }}>
                  {b}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Column: Premium Mockup ──────────────────── */}
      <div className="relative z-[2] flex items-center justify-center p-[clamp(20px,4vw,48px)] max-lg:pt-6 max-lg:pb-10 max-lg:min-h-[340px]">
        <div
          className="relative w-full max-w-[420px] rounded-xl overflow-hidden"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
          }}
        >
          {/* Mockup header */}
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div
              className="size-2.5 rounded-full"
              style={{ backgroundColor: "#ef4444" }}
            />
            <div
              className="size-2.5 rounded-full"
              style={{ backgroundColor: "#eab308" }}
            />
            <div
              className="size-2.5 rounded-full"
              style={{ backgroundColor: "#22c55e" }}
            />
            <span
              className="ml-2 text-[11px] font-medium"
              style={{ color: "var(--muted)" }}
            >
              StudentHub — Staff-matched roles
            </span>
          </div>

          {/* Mockup body */}
          <div className="p-4 space-y-3">
            {/* Search bar */}
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
              style={{
                backgroundColor: "var(--secondary)",
                color: "var(--muted)",
              }}
            >
              <Search className="size-3.5 shrink-0" />
              Search open roles, companies, locations...
              <span
                className="ml-auto text-[10px] px-1.5 py-0.5 rounded font-mono"
                style={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                ⌘K
              </span>
            </div>

            {/* Result card */}
            <div
              className="rounded-lg p-4"
              style={{
                backgroundColor: `${SH_BLUE}08`,
                border: `1px solid ${SH_BLUE}20`,
              }}
            >
              <span
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: SH_BLUE }}
              >
                Matched roles
              </span>
              <strong
                className="block text-[clamp(32px,5vw,48px)] leading-[0.9] mt-1"
                style={{ color: "var(--ink)" }}
              >
                care assistant
              </strong>
              <span className="text-xs block mt-1" style={{ color: "var(--muted)" }}>
                12 matching roles · Kuwait City · KWD 3-5/hr
              </span>
              <div className="flex gap-2 mt-3">
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full"
                  style={{
                    color: "var(--green)",
                    backgroundColor: `${"#24835b"}15`,
                  }}
                >
                  <CheckCircle2 className="size-2.5" />
                  Profile ready
                </span>
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full"
                  style={{
                    color: SH_BLUE,
                    backgroundColor: `${SH_BLUE}15`,
                  }}
                >
                  <CheckCircle2 className="size-2.5" />
                  3 saved roles
                </span>
              </div>
            </div>

            {/* Side-by-side stats cards */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Profile", value: "92%" },
                { label: "Applications", value: "4" },
                { label: "Payment", value: "420 KWD" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg p-3 transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    backgroundColor: "var(--secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider block"
                    style={{ color: "var(--muted)" }}
                  >
                    {item.label}
                  </span>
                  <strong
                    className="text-sm block mt-0.5"
                    style={{ color: "var(--ink)" }}
                  >
                    {item.value}
                  </strong>
                </div>
              ))}
            </div>

            {/* Employer tab note */}
            <div
              className="flex items-center gap-2 p-3 rounded-lg text-xs"
              style={{
                backgroundColor: `${SH_AMBER}0A`,
                border: `1px solid ${SH_AMBER}15`,
                color: SH_AMBER,
              }}
            >
              <Building2 className="size-3.5 shrink-0" />
              <span className="font-medium">Employer view:</span>
              <span style={{ color: "var(--muted)" }}>
                Post jobs, review candidates, approve timesheets
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
