"use client";

import Link from "next/link";
import {
  UserRound,
  Briefcase,
  Building2,
  Shield,
  ClipboardCheck,
  Zap,
  Globe,
  BarChart3,
  Layers,
  ChevronRight,
  Command,
  Sparkles,
  Search,
  PanelRightOpen,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";
import { GlassPanel } from "@/components/ui/glass-panel";
import { portalContent } from "@/modules/auth/portalContent";
import type { Role } from "@/modules/auth/types";

// ── Props ─────────────────────────────────────────────────────

export interface LandingContentProps {
  session: {
    id: string;
    email: string;
    role: string;
    name: string;
  } | null;
}

// ── Data ──────────────────────────────────────────────────────

const benefits = [
  {
    title: "Purpose-built portals",
    body: "Each role gets exactly the right tools — no clutter, no missing features, no one-size-fits-all compromises.",
  },
  {
    title: "Smart candidate search",
    body: "Typo-tolerant, filter-rich search across countries, skills, and statuses. Saved searches for repeat workflows.",
  },
  {
    title: "End-to-end workflows",
    body: "From profile readiness to timesheets and payments — every step is connected in one system.",
  },
  {
    title: "Production-grade foundation",
    body: "Built for real data volumes, real teams, and real compliance — not a prototype.",
  },
];

const platformStats = [
  { number: "128+", label: "Data models", icon: Layers },
  { number: "5", label: "Role-specific portals", icon: Globe },
  { number: "35+", label: "Production routes", icon: BarChart3 },
  { number: "99.9%", label: "Uptime target", icon: Zap },
];

const portalRoles: Role[] = ["candidate", "staff", "company", "admin", "inspector"];

const portalIcons: Record<Role, React.ComponentType<{ className?: string }>> = {
  candidate: UserRound,
  staff: Briefcase,
  company: Building2,
  admin: Shield,
  inspector: ClipboardCheck,
};

const features = [
  {
    icon: Search,
    title: "Global search",
    body: "Typo-tolerant search across countries, skills, and statuses. One keystroke finds any candidate.",
    stat: "0.4s avg response",
  },
  {
    icon: Command,
    title: "Command palette",
    body: "Cmd+K opens every action. Navigate, search, filter, export — all from the keyboard.",
    stat: "42 available commands",
  },
  {
    icon: PanelRightOpen,
    title: "Slide-over details",
    body: "Candidate profiles, documents, and payments slide in from the right. Never leave your workspace.",
    stat: "200ms animated",
  },
];

// ── Component ─────────────────────────────────────────────────

export default function LandingContent({ session }: LandingContentProps) {
  return (
    <main className="min-h-svh w-[min(1320px,calc(100%_-_28px))] mx-auto grid content-start gap-4 pt-[18px] pb-[42px] max-sm:w-[min(calc(100%_-_20px),720px)]">
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
            {session ? (
              <Link
                href="/app"
                className="uiButton uiButton_default uiButton_defaultSize"
              >
                Open app <ChevronRight className="size-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="uiButton uiButton_default uiButton_defaultSize"
                >
                  Get started <Sparkles className="size-3.5" />
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

      {/* ── Hero section ── */}
      <section
        className="shSection relative min-h-[min(780px,calc(100svh_-_96px))] grid grid-cols-1 items-center overflow-hidden rounded-xl p-[clamp(22px,5vw,76px)] max-lg:min-h-auto max-lg:p-7"
        aria-label="Hero introduction"
      >
        {/* Dramatic animated gradient */}
        <div className="shHeroGradientDramatic" aria-hidden="true" />

        {/* Floating ambient orbs */}
        <div className="shOrb shOrbA" aria-hidden="true" />
        <div className="shOrb shOrbB" aria-hidden="true" />
        <div className="shOrb shOrbC" aria-hidden="true" />

        {/* Particle grid overlay */}
        <div className="shParticleGrid" aria-hidden="true" />

        {/* Floating app mockup (enhanced) */}
        <div
          className="absolute inset-0 grid place-items-center place-content-end p-[clamp(20px,4vw,58px)] opacity-[0.92] max-lg:relative max-lg:min-h-[400px] max-lg:order-2 max-lg:p-0 max-lg:pt-[18px]"
          aria-hidden="true"
        >
          <div className="shMockupDramatic">
            {/* Left rail - navigation */}
            <div className="grid content-start gap-2 p-2.5 rounded-xl bg-[var(--sh-glass-bg)]">
              {["Search", "Queue", "Work", "Money"].map((item, i) => (
                <span
                  key={item}
                  className="min-h-9 flex items-center rounded-[7px] px-2.5 text-xs font-black max-sm:justify-center max-sm:px-1.5"
                  style={
                    i === 0
                      ? {
                          background: "var(--sh-info-bg)",
                          color: "var(--sh-info)",
                        }
                      : { color: "var(--muted)" }
                  }
                >
                  {item}
                </span>
              ))}
            </div>

            {/* Center - main panel */}
            <div className="grid content-start gap-2.5 p-3.5 rounded-xl bg-[var(--sh-glass-bg)]">
              {/* Search bar */}
              <div
                className="min-h-[40px] flex items-center gap-2 rounded-lg px-3 bg-[var(--sh-glass-bg-strong)]"
                style={{ border: "1px solid var(--sh-glass-border)" }}
              >
                <Search className="size-3.5 text-[var(--muted)] shrink-0" />
                <span className="text-xs text-[var(--muted)]">Search candidates, jobs, documents...</span>
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
                  Candidate search
                </span>
                <strong className="text-[clamp(42px,6vw,76px)] leading-[0.88]" style={{ color: "var(--ink)" }}>
                  jaafar
                </strong>
                <small style={{ color: "var(--muted)" }}>
                  80 scoped results · FAD · needs review · Lebanon
                </small>
                <div className="flex gap-2 mt-1.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-[var(--sh-success-bg)] text-[var(--sh-success)]">
                    <CheckCircle2 className="size-3" /> Profile ready
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-[var(--sh-info-bg)] text-[var(--sh-info)]">
                    CV export
                  </span>
                </div>
              </div>

              {/* Action bar */}
              <div className="grid grid-cols-4 gap-2 max-sm:grid-cols-1">
                {[
                  { label: "Profile", status: "Live" },
                  { label: "CV", status: "PDF" },
                  { label: "Timesheet", status: "Pending" },
                  { label: "Payment", status: "Ready" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="min-h-[92px] grid content-between rounded-lg p-3 bg-[var(--sh-glass-bg)]"
                    style={{ border: "1px solid var(--sh-glass-border)" }}
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

            {/* Right panel - command detail */}
            <div className="grid content-start gap-2.5 p-3.5 rounded-xl bg-[var(--sh-glass-bg)] max-lg:hidden">
              <div
                className="min-h-[140px] grid content-end gap-2 rounded-lg p-[14px]"
                style={{
                  background: "var(--sh-glass-bg-strong)",
                  border: "1px solid var(--sh-glass-border)",
                }}
              >
                <span className="text-[var(--sh-info)] text-[10px] font-black uppercase tracking-wider">
                  Command
                </span>
                <strong className="text-[18px] leading-[1.1]" style={{ color: "var(--ink)" }}>
                  Send CVs to employer
                </strong>
                <small style={{ color: "var(--muted)" }}>
                  Same action layer for staff and admin, scoped by role.
                </small>
              </div>
              <div
                className="min-h-[100px] grid content-between rounded-lg p-[14px]"
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
                  <span className="text-xs text-[var(--ink)]">CV ready for 4 candidates</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero copy */}
        <div className="relative z-[2] max-w-[690px] max-lg:max-w-none">
          <p className="shHeroEyebrow">
            <Sparkles className="size-3" />
            Next-generation StudentHub
          </p>
          <h1 className="shHeroTitle">
            One modern platform,<br />
            <span className="shHeroHighlight">purpose-built portals.</span>
          </h1>
          <p className="shHeroBody">
            A Silicon Valley-grade rebuild for candidates, staff, companies, inspectors, and admins. One
            login opens the right workspace, while shared modules keep search, documents, payments, and
            reporting unified.
          </p>
          <div className="flex flex-wrap items-center gap-3.5 mt-4 max-sm:flex-col max-sm:items-stretch">
            <Link
              href="/signup"
              className="uiButton uiButton_default uiButton_lg shGlowButton"
            >
              Get started <ArrowUpRight className="size-4" />
            </Link>
            <Link
              href="/login"
              className="uiButton uiButton_ghost uiButton_lg"
            >
              Sign in
            </Link>
          </div>
          <div className="flex flex-wrap gap-2 mt-[18px]" aria-label="StudentHub platform goals">
            {[
              "Role-specific workspaces",
              "Shared search and documents",
              "Production-data migration path",
            ].map((stat) => (
              <span key={stat} className="shHeroPill">
                {stat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform stats bar ── */}
      <section
        className="shSection grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-6 rounded-xl"
        style={{
          background: "var(--sh-glass-bg)",
          border: "1px solid var(--sh-glass-border)",
        }}
        aria-label="Platform at a glance"
      >
        {platformStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="shCard flex items-center gap-3 max-sm:flex-col max-sm:text-center"
              style={{ animationDelay: `${i * 80 + 100}ms` }}
            >
              <Icon
                className="size-8 shrink-0"
                style={{ color: "var(--sh-info)" }}
                aria-hidden="true"
              />
              <div>
                <strong className="text-xl block" style={{ color: "var(--ink)" }}>
                  {stat.number}
                </strong>
                <small style={{ color: "var(--muted)" }}>{stat.label}</small>
              </div>
            </div>
          );
        })}
      </section>

      {/* ── Feature highlights ── */}
      <section
        className="shSection grid grid-cols-1 sm:grid-cols-3 gap-2.5"
        aria-label="Key features"
      >
        {features.map((feat, i) => {
          const Icon = feat.icon;
          return (
            <div
              key={feat.title}
              className="shCard rounded-xl p-5"
              style={{
                background: "var(--sh-glass-bg)",
                border: "1px solid var(--sh-glass-border)",
                animationDelay: `${i * 100 + 150}ms`,
              }}
            >
              <Icon className="size-5 mb-3" style={{ color: "var(--sh-info)" }} aria-hidden="true" />
              <strong className="shCardTitle">{feat.title}</strong>
              <p className="shCardBody">{feat.body}</p>
              <span className="shCardStat">{feat.stat}</span>
            </div>
          );
        })}
      </section>

      {/* ── Portal grid ── */}
      <section
        className="shSection grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 max-sm:gap-2"
        aria-label="StudentHub role portals"
      >
        {portalRoles.map((role, i) => {
          const portal = portalContent[role];
          const Icon = portalIcons[role];
          return (
            <Link
              href={portal.href}
              key={role}
              className="shPortalCard group no-underline"
            >
              <GlassPanel
                variant="subtle"
                radius="lg"
                className="shCard h-full transition-all duration-[280ms] group-hover:-translate-y-0.5 group-hover:shadow-[0_16px_45px_rgba(16,24,40,0.1)] cursor-pointer"
                style={{ animationDelay: `${i * 80 + 100}ms` }}
              >
                <div className="flex flex-col gap-2 p-4">
                  <Icon
                    className="size-5 shrink-0 text-[var(--sh-info)]"
                    aria-hidden="true"
                  />
                  <span className="text-[var(--sh-info)] text-[11px] font-black uppercase">
                    {portal.label}
                  </span>
                  <strong className="text-sm" style={{ color: "var(--ink)" }}>
                    {portal.audience}
                  </strong>
                  <small
                    className="text-xs leading-relaxed"
                    style={{ color: "var(--muted)" }}
                  >
                    {portal.promise}
                  </small>
                </div>
              </GlassPanel>
            </Link>
          );
        })}
      </section>

      {/* ── Benefits ── */}
      <section
        className="shSection shBenefitSection"
        aria-label="Why StudentHub"
      >
        <div>
          <p className="text-[var(--sh-info)] text-[11px] font-black uppercase tracking-wider">
            Why StudentHub
          </p>
          <h2 className="shBenefitsTitle">Built for how staffing actually works.</h2>
          <p className="leading-relaxed" style={{ color: "var(--muted)" }}>
            Not a generic dashboard. Every feature is shaped by real placement workflows — search,
            shortlisting, document exchange, timesheets, and payments run in one system.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {benefits.map((b, i) => (
            <div
              key={b.title}
              className="shCard shBenefitCard"
              style={{ animationDelay: `${i * 80 + 200}ms` }}
            >
              <strong className="text-sm" style={{ color: "var(--ink)" }}>
                {b.title}
              </strong>
              <p
                className="text-xs leading-relaxed m-0"
                style={{ color: "var(--muted)" }}
              >
                {b.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
