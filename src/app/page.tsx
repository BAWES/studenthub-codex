import Link from "next/link";
import type { Route } from "next";
import {
  UserRound,
  Briefcase,
  Building2,
  Shield,
  ClipboardCheck,
  Sparkles,
  Search,
  Layers,
  Workflow,
  ShieldCheck,
} from "lucide-react";
import { getSession } from "@/modules/auth/session";
import { portalContent } from "@/modules/auth/portalContent";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";
import { GlassPanel } from "@/components/ui/glass-panel";

export const dynamic = "force-dynamic";

const benefits = [
  {
    title: "Purpose-built portals",
    body: "Each role gets exactly the right tools — no clutter, no missing features, no one-size-fits-all compromises.",
    icon: Layers,
  },
  {
    title: "Smart candidate search",
    body: "Typo-tolerant, filter-rich search across countries, skills, and statuses. Saved searches for repeat workflows.",
    icon: Search,
  },
  {
    title: "End-to-end workflows",
    body: "From profile readiness to timesheets and payments — every step is connected in one system.",
    icon: Workflow,
  },
  {
    title: "Production-grade foundation",
    body: "Built for real data volumes, real teams, and real compliance — not a prototype.",
    icon: ShieldCheck,
  },
];

const portalRoles = ["candidate", "staff", "company", "admin", "inspector"] as const;

const portalIcons: Record<(typeof portalRoles)[number], React.ComponentType<{ className?: string }>> = {
  candidate: UserRound,
  staff: Briefcase,
  company: Building2,
  admin: Shield,
  inspector: ClipboardCheck,
};

const mockupResults = [
  { name: "Jaafar Al-Hassan", meta: "FAD · Lebanon", color: "var(--sh-success)", active: true },
  { name: "Aisha Al-Mutairi", meta: "Cashier · Kuwait", color: "var(--sh-warning)" },
  { name: "Mohammed Ali", meta: "Sales · UAE", color: "var(--sh-info)" },
];

export default async function Home() {
  const session = await getSession();

  return (
    <main className="min-h-svh w-[min(1320px,calc(100%_-_28px))] mx-auto grid content-start gap-4 pt-[18px] pb-[42px] max-sm:w-[min(calc(100%_-_20px),720px)]">
      {/* ── Glass Nav ───────────────────────────────────────────────────── */}
      <nav className="shGlassNav" aria-label="StudentHub public navigation">
        <div className="shGlassNavInner">
          <Link
            className="inline-flex items-center gap-2.5 text-[var(--ink)] px-2 no-underline min-h-11"
            href="/"
          >
            <span className="size-9 inline-flex items-center justify-center rounded-lg bg-[var(--ink)] text-[var(--paper)] font-black transition-transform duration-[280ms] group-hover:scale-105">
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
                Open app
              </Link>
            ) : (
              <Link
                href="/login"
                className="uiButton uiButton_default uiButton_defaultSize"
              >
                Sign in
              </Link>
            )}
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* ── Hero Section ───────────────────────────────────────────────── */}
      <section
        className="shSection relative min-h-[min(760px,calc(100svh_-_96px))] grid grid-cols-1 items-center overflow-hidden rounded-xl p-[clamp(22px,5vw,76px)] max-lg:min-h-auto max-lg:p-7"
        aria-label="StudentHub platform overview"
      >
        {/* Floating gradient orbs */}
        <div className="shOrb shOrbA" aria-hidden="true" />
        <div className="shOrb shOrbB" aria-hidden="true" />
        <div className="shOrb shOrbC" aria-hidden="true" />

        {/* Dramatic animated gradient */}
        <div className="shHeroGradientDramatic" aria-hidden="true" />

        {/* Particle grid */}
        <div
          className="shParticleGrid"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
          aria-hidden="true"
        />

        {/* Floating glass mockup */}
        <div
          className="absolute inset-0 grid place-items-center place-content-end p-[clamp(20px,4vw,58px)] opacity-[0.94] max-lg:relative max-lg:min-h-[380px] max-lg:order-2 max-lg:p-0 max-lg:pt-[18px]"
          aria-hidden="true"
        >
          <div className="shMockupDramatic">
            {/* Rail — navigation mockup */}
            <div className="shMockupRail">
              {["Search", "Queue", "Work", "Pay"].map((item, i) => (
                <span
                  key={item}
                  className={`shMockupRailItem${i === 0 ? " active" : ""}`}
                >
                  {item}
                </span>
              ))}
            </div>
            {/* Main — search results mockup */}
            <div className="shMockupMain">
              <div className="shMockupSearchArea">
                <span
                  className="text-[11px] font-black uppercase tracking-[0.04em]"
                  style={{ color: "var(--sh-info)" }}
                >
                  Candidate search
                </span>
                <strong
                  className="text-[clamp(36px,5vw,68px)] leading-[0.88]"
                  style={{ color: "var(--ink)" }}
                >
                  jaafar
                </strong>
                <small style={{ color: "var(--muted)" }}>
                  80 scoped results · FAD · needs review · Lebanon
                </small>
              </div>
              {/* Search result rows */}
              <div className="grid gap-1">
                {mockupResults.map((r) => (
                  <div key={r.name} className="shMockupResult">
                    <span
                      className="shMockupResultDot"
                      style={{ background: r.color }}
                    />
                    <span className="shMockupResultName">{r.name}</span>
                    <span className="shMockupResultMeta">{r.meta}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Aside — quick commands mockup */}
            <div className="shMockupAside max-lg:hidden">
              <span className="shMockupAsideLabel">Command</span>
              <div className="shMockupAsideValue">
                Send CVs to employer
              </div>
              <div className="shMockupAsideSmall">
                Same action layer for staff and admin, scoped by role.
              </div>
            </div>
          </div>
        </div>

        {/* Hero copy */}
        <div className="relative z-[2] max-w-[690px] max-lg:max-w-none">
          <p className="shHeroText shHeroEyebrow">
            <Sparkles className="size-3" aria-hidden="true" />
            Next-generation StudentHub
          </p>
          <h1 className="shHeroText shHeroTitle">
            One modern platform,<br />
            <span className="shHeroGlowText">purpose-built portals.</span>
          </h1>
          <p className="shHeroText shHeroBody">
            A Silicon Valley-grade rebuild for candidates, staff, companies,
            inspectors, and admins. One login opens the right workspace, while
            shared modules keep search, documents, payments, and reporting
            unified.
          </p>
          <div className="shHeroText flex flex-wrap items-center gap-3.5 mt-4 max-sm:flex-col max-sm:items-stretch">
            <Link href="/login" className="uiButton uiButton_default uiButton_lg">
              Sign in
            </Link>
          </div>
          <div
            className="shHeroText flex flex-wrap gap-2 mt-[18px]"
            aria-label="StudentHub platform goals"
          >
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

      {/* ── Portal Grid ──────────────────────────────────────────────── */}
      <section
        className="shSection grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 max-sm:gap-2"
        aria-label="StudentHub portals"
      >
        {portalRoles.map((role, i) => {
          const portal = portalContent[role];
          const Icon = portalIcons[role];
          return (
            <Link
              href={portal.href as Route}
              key={role}
              className="shCard shPortalCard group no-underline"
              style={{ animationDelay: `${100 + i * 80}ms` }}
            >
              <GlassPanel
                variant="subtle"
                radius="lg"
                className="h-full transition-all duration-[280ms] var(--sh-easing) group-hover:-translate-y-0.5 group-hover:shadow-[0_16px_45px_rgba(16,24,40,0.10)] cursor-pointer"
              >
                <div className="flex flex-col gap-2 p-4">
                  <Icon className="size-5 shrink-0 text-[var(--sh-info)]" aria-hidden="true" />
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

      {/* ── Benefits Section ─────────────────────────────────────────── */}
      <section
        className="shSection shBenefitSection"
        aria-label="Why StudentHub"
      >
        <div>
          <p className="text-[var(--sh-info)] text-[11px] font-black uppercase">
            Why StudentHub
          </p>
          <h2 className="shHeroTitle text-[clamp(28px,3.6vw,44px)] leading-[0.98] mt-2">
            Built for how staffing <span className="shHeroGlowText">actually works.</span>
          </h2>
          <p
            className="leading-relaxed mt-3"
            style={{ color: "var(--muted)", fontSize: "clamp(14px,1.3vw,16px)" }}
          >
            Not a generic dashboard. Every feature is shaped by real placement
            workflows — search, shortlisting, document exchange, timesheets, and
            payments run in one system.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="shCard shBenefitCard"
                style={{ animationDelay: `${100 + i * 100}ms` }}
              >
                <Icon
                  className="size-4 text-[var(--sh-info)]"
                  aria-hidden="true"
                />
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
            );
          })}
        </div>
      </section>
    </main>
  );
}
