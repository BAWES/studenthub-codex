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
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";
import { GlassPanel } from "@/components/ui/glass-panel";
import { portalContent } from "@/modules/auth/portalContent";
import { HeroSection } from "@/components/marketing";
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

// ── Feature card data (simplified, integrated into FeatureGrid) ──

const featureCards = [
  {
    icon: Zap,
    title: "Global search",
    body: "Typo-tolerant search across countries, skills, and statuses. One keystroke finds any candidate.",
    stat: "0.4s avg response",
  },
  {
    icon: Layers,
    title: "Purpose-built portals",
    body: "Each role gets exactly the right tools — no clutter, no missing features, no one-size-fits-all compromises.",
    stat: "5 role-specific portals",
  },
  {
    icon: Globe,
    title: "End-to-end workflows",
    body: "From profile readiness to timesheets and payments — every step is connected in one system.",
    stat: "Integrated pipelines",
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
                  href="/signup?role=candidate"
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

      {/* ── Hero section — Candidate persona ── */}
      <HeroSection persona="candidate" />

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
        {featureCards.map((feat, i) => {
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
