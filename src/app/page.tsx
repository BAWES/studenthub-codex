import Link from "next/link";
import type { Route } from "next";
import { UserRound, Briefcase, Building2, Shield, ClipboardCheck } from "lucide-react";
import { getSession } from "@/modules/auth/session";
import { portalContent } from "@/modules/auth/portalContent";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

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
      {/* Nav */}
      <nav
        className="sticky top-3 z-20 min-h-[62px] flex items-center justify-between gap-3.5 border border-[color-mix(in_srgb,var(--line)_84%,transparent)] rounded-lg bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] p-2 shadow-[0_18px_50px_rgba(16,24,40,0.08)] max-sm:static max-sm:flex-col max-sm:items-stretch"
        aria-label="StudentHub public navigation"
      >
        <Link
          className="inline-flex items-center gap-2.5 text-[var(--ink)] px-2 no-underline min-h-11"
          href="/"
        >
          <span className="size-9 inline-flex items-center justify-center rounded-lg bg-[var(--ink)] text-[var(--surface)] font-black">
            SH
          </span>
          <strong>StudentHub</strong>
        </Link>
        <div className="flex items-center gap-3.5 max-sm:flex-col max-sm:items-stretch">
          {session ? (
            <Button variant="outline" asChild>
              <Link href="/app">Open app</Link>
            </Button>
          ) : (
            <Button variant="outline" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          )}
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[min(760px,calc(100svh_-_96px))] grid grid-cols-1 items-center overflow-hidden border border-[var(--line)] rounded-lg bg-[var(--surface)] p-[clamp(22px,5vw,76px)] max-lg:min-h-auto max-lg:p-7 after:absolute after:inset-0 after:pointer-events-none after:bg-[linear-gradient(90deg,var(--surface)_0%,color-mix(in_srgb,var(--surface)_94%,transparent)_38%,transparent_78%),linear-gradient(180deg,transparent_72%,var(--surface)_100%)] max-lg:after:bg-[linear-gradient(180deg,var(--surface)_0%,color-mix(in_srgb,var(--surface)_94%,transparent)_56%,var(--surface)_100%)]">
        {/* Decorative stage */}
        <div
          className="absolute inset-0 grid place-items-center place-content-end p-[clamp(20px,4vw,58px)] opacity-[0.96] max-lg:relative max-lg:min-h-[360px] max-lg:order-2 max-lg:p-0 max-lg:pt-[18px]"
          aria-hidden="true"
        >
          <div className="w-[min(880px,72vw)] min-h-[510px] grid grid-cols-[132px_minmax(0,1fr)_220px] gap-2.5 border border-[var(--line)] rounded-lg bg-[color-mix(in_srgb,var(--surface-soft)_92%,transparent)] p-2.5 shadow-[var(--shadow)] max-lg:w-full max-lg:min-h-[360px] max-lg:grid-cols-[92px_minmax(0,1fr)] max-sm:grid-cols-1">
            {/* Rail */}
            <div className="grid content-start gap-2 p-3 border border-[var(--line)] rounded-lg bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] max-sm:grid-cols-4">
              {["Search", "Queue", "Work", "Money"].map((item, i) => (
                <span
                  key={item}
                  className={
                    i === 0
                      ? "min-h-9 flex items-center rounded-[7px] bg-[color-mix(in_srgb,var(--blue)_12%,var(--surface))] text-[var(--blue)] text-xs font-black px-2.5 max-sm:justify-center max-sm:px-1.5"
                      : "min-h-9 flex items-center rounded-[7px] text-[var(--muted)] text-xs font-black px-2.5 max-sm:justify-center max-sm:px-1.5"
                  }
                >
                  {item}
                </span>
              ))}
            </div>
            {/* Main */}
            <div className="grid content-start gap-2.5 p-3.5 border border-[var(--line)] rounded-lg bg-[color-mix(in_srgb,var(--surface)_94%,transparent)]">
              <div className="min-h-[170px] grid content-end gap-2 border border-[var(--line)] rounded-lg bg-[var(--surface-soft)] p-[18px]">
                <span className="text-[var(--blue)] text-[11px] font-black uppercase">Candidate search</span>
                <strong className="text-[clamp(42px,6vw,76px)] leading-[0.88]">jaafar</strong>
                <small className="text-[var(--muted)]">80 scoped results · FAD · needs review · Lebanon</small>
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
                    className="min-h-[138px] grid content-between border border-[var(--line)] rounded-lg bg-[var(--surface)] p-3.5 max-sm:min-h-[92px]"
                  >
                    <span className="text-[var(--blue)] text-[11px] font-black uppercase">{item.label}</span>
                    <strong className="text-2xl">{item.status}</strong>
                  </div>
                ))}
              </div>
            </div>
            {/* Aside */}
            <div className="grid content-end gap-2 p-4 border border-[var(--line)] rounded-lg bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] max-lg:hidden">
              <span className="text-[var(--blue)] text-[11px] font-black uppercase">Command</span>
              <strong className="text-[22px] leading-[1.08]">Send CVs to employer</strong>
              <small className="text-[var(--muted)]">Same action layer for staff and admin, scoped by role.</small>
            </div>
          </div>
        </div>
        {/* Hero copy */}
        <div className="relative z-[2] max-w-[690px] max-lg:max-w-none">
          <h1 className="mt-0 text-[clamp(44px,6.4vw,92px)] leading-[0.94] max-sm:text-[40px]">
            Staff-matched placements, streamlined.
          </h1>
          <p className="max-w-[620px] text-[clamp(17px,1.7vw,21px)]">
            StudentHub connects staff recruiters with qualified candidates — from profile readiness to timesheets 
            and payments. One platform, one placement cycle, complete visibility.
          </p>
          <div className="flex flex-wrap items-center gap-3.5 mt-4 max-sm:flex-col max-sm:items-stretch">
            <Button size="lg" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-[18px]" aria-label="Placement keywords">
            {["Staff-recruited matching", "End-to-end workflows", "Real-time pay and compliance"].map(
              (stat) => (
                <span
                  key={stat}
                  className="min-h-8 inline-flex items-center border border-[var(--line)] rounded-full bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] px-3 text-[var(--blue)] text-[11px] font-black uppercase"
                >
                  {stat}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* Portal grid */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 max-sm:gap-2" aria-label="StudentHub portals">
        {portalRoles.map((role) => {
          const portal = portalContent[role];
          const Icon = portalIcons[role];
          return (
            <Link
              href={portal.href as Route}
              key={role}
              className="group no-underline transition-[border-color,background,transform,box-shadow] duration-140"
            >
              <Card className="h-full group-hover:-translate-y-0.5 group-hover:shadow-[0_16px_45px_rgba(16,24,40,0.1)]">
                <CardContent className="flex flex-col gap-2 p-4">
                  <Icon className="size-5 text-[var(--blue)] shrink-0" aria-hidden="true" />
                  <span className="text-[var(--blue)] text-[11px] font-black uppercase">{portal.label}</span>
                  <strong className="text-sm">{portal.audience}</strong>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
