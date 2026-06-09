import Link from "next/link";
import type { Route } from "next";
import { UserRound, Briefcase, Building2, Shield, ClipboardCheck, Sparkles } from "lucide-react";
import { getSession } from "@/modules/auth/session";
import { portalContent } from "@/modules/auth/portalContent";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";
import { GlassPanel } from "@/components/ui/glass-panel";

export const dynamic = "force-dynamic";

const benefits = [
  {
    title: "Purpose-built portals",
    body: "Each role gets exactly the right tools — no clutter, no missing features, no one-size-fits-all compromises."
  },
  {
    title: "Smart candidate search",
    body: "Typo-tolerant, filter-rich search across countries, skills, and statuses. Saved searches for repeat workflows."
  },
  {
    title: "End-to-end workflows",
    body: "From profile readiness to timesheets and payments — every step is connected in one system."
  },
  {
    title: "Production-grade foundation",
    body: "Built for real data volumes, real teams, and real compliance — not a prototype."
  }
];

const portalRoles = ["candidate", "staff", "company", "admin", "inspector"] as const;

const portalIcons: Record<(typeof portalRoles)[number], React.ComponentType<{ className?: string }>> = {
  candidate: UserRound,
  staff: Briefcase,
  company: Building2,
  admin: Shield,
  inspector: ClipboardCheck
};

export default async function Home() {
  const session = await getSession();

  return (
    <main className="min-h-svh w-[min(1320px,calc(100%_-_28px))] mx-auto grid content-start gap-4 pt-[18px] pb-[42px] max-sm:w-[min(calc(100%_-_20px),720px)]">
      {/* Glass Nav */}
      <nav
        className="sticky top-3 z-20 min-h-[62px] flex items-center justify-between gap-3.5 rounded-xl bg-[var(--sh-glass-bg-strong)] backdrop-blur-xl p-2 shadow-[0_18px_50px_rgba(16,24,40,0.08)] max-sm:static max-sm:flex-col max-sm:items-stretch"
        style={{ border: "1px solid var(--sh-glass-border)" }}
        aria-label="StudentHub public navigation"
      >
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
              Open app
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="uiButton uiButton_default uiButton_defaultSize"
              >
                Get started
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
      </nav>

      {/* Animated Gradient Hero */}
      <section className="relative min-h-[min(760px,calc(100svh_-_96px))] grid grid-cols-1 items-center overflow-hidden rounded-xl p-[clamp(22px,5vw,76px)] max-lg:min-h-auto max-lg:p-7">
        {/* Animated gradient background */}
        <div className="shHeroGradient" aria-hidden="true" />

        {/* Floating glass panels mockup */}
        <div className="absolute inset-0 grid place-items-center place-content-end p-[clamp(20px,4vw,58px)] opacity-[0.92] max-lg:relative max-lg:min-h-[360px] max-lg:order-2 max-lg:p-0 max-lg:pt-[18px]" aria-hidden="true">
          <div className="shHeroMockup">
            {/* Rail */}
            <div className="grid content-start gap-2 p-3 rounded-lg" style={{ background: "var(--sh-glass-bg)", border: "1px solid var(--sh-glass-border)" }}>
              {["Search", "Queue", "Work", "Money"].map((item, i) => (
                <span
                  key={item}
                  className={
                    i === 0
                      ? "min-h-9 flex items-center rounded-[7px] px-2.5 text-xs font-black max-sm:justify-center max-sm:px-1.5"
                      : "min-h-9 flex items-center rounded-[7px] px-2.5 text-xs font-black max-sm:justify-center max-sm:px-1.5"
                  }
                  style={
                    i === 0
                      ? { background: "var(--sh-info-bg)", color: "var(--sh-info)" }
                      : { color: "var(--muted)" }
                  }
                >
                  {item}
                </span>
              ))}
            </div>
            {/* Main */}
            <div className="grid content-start gap-2.5 p-3.5 rounded-lg" style={{ background: "var(--sh-glass-bg)", border: "1px solid var(--sh-glass-border)" }}>
              <div className="min-h-[170px] grid content-end gap-2 rounded-lg p-[18px]" style={{ background: "var(--sh-glass-bg-strong)", border: "1px solid var(--sh-glass-border)" }}>
                <span className="text-[var(--sh-info)] text-[11px] font-black uppercase">Candidate search</span>
                <strong className="text-[clamp(42px,6vw,76px)] leading-[0.88]" style={{ color: "var(--ink)" }}>jaafar</strong>
                <small style={{ color: "var(--muted)" }}>80 scoped results · FAD · needs review · Lebanon</small>
              </div>
              <div className="grid grid-cols-4 gap-2.5 max-sm:grid-cols-1">
                {[
                  { label: "Profile ready", status: "Live" },
                  { label: "CV export", status: "PDF" },
                  { label: "Timesheet", status: "Live" },
                  { label: "Payment", status: "Live" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="min-h-[138px] grid content-between rounded-lg p-3.5 max-sm:min-h-[92px]"
                    style={{ background: "var(--sh-glass-bg)", border: "1px solid var(--sh-glass-border)" }}
                  >
                    <span className="text-[var(--sh-info)] text-[11px] font-black uppercase">{item.label}</span>
                    <strong className="text-2xl" style={{ color: "var(--ink)" }}>{item.status}</strong>
                  </div>
                ))}
              </div>
            </div>
            {/* Aside */}
            <div className="grid content-end gap-2 p-4 rounded-lg max-lg:hidden" style={{ background: "var(--sh-glass-bg)", border: "1px solid var(--sh-glass-border)" }}>
              <span className="text-[var(--sh-info)] text-[11px] font-black uppercase">Command</span>
              <strong className="text-[22px] leading-[1.08]" style={{ color: "var(--ink)" }}>Send CVs to employer</strong>
              <small style={{ color: "var(--muted)" }}>Same action layer for staff and admin, scoped by role.</small>
            </div>
          </div>
        </div>

        {/* Hero copy — sits above the gradient */}
        <div className="relative z-[2] max-w-[690px] max-lg:max-w-none">
          <p className="shHeroEyebrow">Next-generation StudentHub</p>
          <h1 className="shHeroTitle">
            One modern platform,<br />
            <span className="shHeroHighlight">purpose-built portals.</span>
          </h1>
          <p className="shHeroBody">
            A Silicon Valley-grade rebuild for candidates, staff, companies, inspectors, and admins. One login opens the
            right workspace, while shared modules keep search, documents, payments, and reporting unified.
          </p>
          <div className="flex flex-wrap items-center gap-3.5 mt-4 max-sm:flex-col max-sm:items-stretch">
            <Link
              href="/signup"
              className="uiButton uiButton_default uiButton_lg"
            >
              Get started
            </Link>
            <Link
              href="/login"
              className="uiButton uiButton_ghost uiButton_lg"
            >
              Sign in
            </Link>
          </div>
          <div className="flex flex-wrap gap-2 mt-[18px]" aria-label="StudentHub platform goals">
            {["Role-specific workspaces", "Shared search and documents", "Production-data migration path"].map(
              (stat) => (
                <span
                  key={stat}
                  className="shHeroPill"
                >
                  {stat}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* Portal grid — glass panels */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 max-sm:gap-2" aria-label="StudentHub portals">
        {portalRoles.map((role) => {
          const portal = portalContent[role];
          const Icon = portalIcons[role];
          return (
            <Link
              href={portal.href as Route}
              key={role}
              className="group no-underline"
            >
              <GlassPanel
                variant="subtle"
                radius="lg"
                className="h-full transition-all duration-[280ms] group-hover:-translate-y-0.5 group-hover:shadow-[0_16px_45px_rgba(16,24,40,0.1)] cursor-pointer"
              >
                <div className="flex flex-col gap-2 p-4">
                  <Icon className="size-5 shrink-0 text-[var(--sh-info)]" aria-hidden="true" />
                  <span className="text-[var(--sh-info)] text-[11px] font-black uppercase">{portal.label}</span>
                  <strong className="text-sm" style={{ color: "var(--ink)" }}>{portal.audience}</strong>
                  <small className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{portal.promise}</small>
                </div>
              </GlassPanel>
            </Link>
          );
        })}
      </section>

      {/* Benefits section — glass morphism */}
      <section
        className="shBenefitsSection"
        aria-label="Why StudentHub"
      >
        <div>
          <p className="text-[var(--sh-info)] text-[11px] font-black uppercase">Why StudentHub</p>
          <h2 className="shBenefitsTitle">
            Built for how staffing actually works.
          </h2>
          <p className="leading-relaxed" style={{ color: "var(--muted)" }}>
            Not a generic dashboard. Every feature is shaped by real placement workflows — search, shortlisting,
            document exchange, timesheets, and payments run in one system.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {benefits.map((b) => (
            <GlassPanel key={b.title} variant="subtle" radius="lg">
              <div className="grid content-start gap-1 p-4">
                <strong className="text-sm" style={{ color: "var(--ink)" }}>{b.title}</strong>
                <p className="text-xs leading-relaxed m-0" style={{ color: "var(--muted)" }}>{b.body}</p>
              </div>
            </GlassPanel>
          ))}
        </div>
      </section>
    </main>
  );
}
