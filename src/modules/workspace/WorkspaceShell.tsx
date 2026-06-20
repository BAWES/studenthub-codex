"use client";

import type { SessionUser } from "@/modules/auth/types";
import type { Route } from "next";
import { logoutAction } from "@/modules/auth/actions";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { navForRole } from "./navigation";
import { Separator } from "@/components/ui/separator";
import { WorkspaceNavigation } from "./WorkspaceNavigation";
import { MobileNavBar } from "@/components/ui/mobile-nav-bar";
import { useWorkspaceOS } from "./WorkspaceOSContext";
import { EmptyState } from "./EmptyState";
import { MetricCard } from "@/components/ui/metric-card";
import { RoleSwitcher } from "./RoleSwitcher";

type Metric = {
  label: string;
  value: string | number;
  note: string;
  /** Trend direction for arrows + colour */
  trend?: "up" | "down" | "flat";
  /** Trend change text (e.g. "+12%") */
  trendLabel?: string;
  /** Inline sparkline data points (3–12 numbers) */
  sparklineData?: number[];
  /** Accent colour for the sparkline & glow */
  accent?: "primary" | "success" | "warning" | "info";
};

type Row = {
  id: string | number;
  title: string;
  subtitle: string;
  meta?: string;
  href?: string;
};

export function WorkspaceShell({
  session,
  title,
  eyebrow,
  metrics,
  primary,
  secondary,
  children
}: {
  session: SessionUser;
  title: string;
  eyebrow: string;
  metrics: Metric[];
  primary?: { title: string; rows: Row[] };
  secondary?: { title: string; rows: Row[] };
  children?: React.ReactNode;
}) {
  const { embedded } = useWorkspaceOS();
  const navItems = navForRole(session.role);

  const rail = (
    <aside
      className="group/rail sticky top-0 h-svh grid grid-rows-[auto_minmax(0,1fr)_auto] gap-1 p-2 border-r border-border overflow-hidden z-30 transition-all duration-300 w-14 hover:w-[200px] hover:border-r-[color-mix(in_srgb,#eb6651_30%,hsl(var(--border)))]"
      aria-label="Workspace sidebar"
    >
      <Link
        className="flex items-center justify-center w-11 h-11 rounded-[calc(var(--radius)-2px)] border border-border bg-foreground text-background no-underline overflow-hidden hover:w-full hover:justify-start hover:gap-2.5 hover:px-2.5 transition-all duration-300"
        href="/app"
        aria-label="StudentHub app"
      >
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-primary text-white text-[11px] font-bold shrink-0">SH</span>
        <strong className="opacity-0 group-hover/rail:opacity-100 transition-opacity duration-300 delay-[80ms] text-sm font-semibold whitespace-nowrap">StudentHub</strong>
      </Link>
      <WorkspaceNavigation items={navItems} role={session.role} />
      <Separator className="mx-2 my-1" />
      <div className="grid gap-1 transition-all duration-300 w-11 group-hover/rail:w-full">
        <RoleSwitcher
          currentRole={session.role}
          availableRoles={(session.roles ?? [session.role]) as any}
        />
        <ThemeToggle />
        <form action={logoutAction}>
          <button type="submit" aria-label="Sign out">
            <LogOut size={18} strokeWidth={1.5} aria-hidden="true" />
            <span>Sign out</span>
          </button>
        </form>
      </div>
    </aside>
  );

  const stage = (
    <section className="min-w-0 overflow-x-hidden grid content-start gap-3.5 p-3.5">
      <section className="sticky top-[10px] z-20 flex items-center justify-between gap-3 min-h-14 px-4 mb-1 rounded-lg bg-card border border-border transition-colors duration-200 hover:border-[color-mix(in_srgb,#eb6651_30%,hsl(var(--border)))] hover:shadow-sm">
        <div className="grid gap-0.5 min-w-0">
          <p className="m-0 text-[#eb6651] text-[11px] font-black uppercase tracking-[0.04em]">{eyebrow}</p>
          <h1 className="m-0 text-lg font-semibold leading-tight text-foreground">{title}</h1>
        </div>
        <div className="flex items-center gap-2.5 min-h-10 px-3 rounded-sm bg-card border border-border transition-colors duration-180 hover:border-[color-mix(in_srgb,#eb6651_30%,hsl(var(--border)))]">
          <span className="text-[11px] font-bold uppercase tracking-[0.03em] text-primary px-1.5 py-0.5 rounded bg-primary/10">{session.role}</span>
          <strong className="text-sm font-semibold text-foreground whitespace-nowrap">{session.name}</strong>
          <small className="text-xs text-muted-foreground hidden">{session.email}</small>
        </div>
      </section>

      {metrics.length ? (
        <section
          className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2.5"
          aria-label={`${session.role} workspace metrics`}
        >
          {metrics.map((metric, i) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              note={metric.note}
              trend={metric.trend}
              trendLabel={metric.trendLabel}
              sparklineData={metric.sparklineData}
              accent={metric.accent}
              entranceDelay={i * 60}
            />
          ))}
        </section>
      ) : null}

      {children}

      <section className="lists">
        {primary ? <WorkspaceList title={primary.title} rows={primary.rows} /> : null}
        {secondary ? <WorkspaceList title={secondary.title} rows={secondary.rows} /> : null}
      </section>
    </section>
  );

  const skipLink = (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-foreground focus:shadow-lg focus:outline-none"
    >
      Skip to content
    </a>
  );

  const mainContent = embedded
    ? (
      <div className="block">
        {stage}
        <MobileNavBar role={session.role} />
      </div>
    )
    : (
      <>
        {skipLink}
        <main id="main-content" className="shell">
          {rail}
          {stage}
          <MobileNavBar role={session.role} />
        </main>
      </>
    );

  return mainContent;
}

function WorkspaceList({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <section className="grid gap-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="m-0 text-sm font-semibold text-foreground">{title}</h2>
        <span className="text-xs text-muted-foreground font-medium">{rows.length}</span>
      </div>
      <div className="grid gap-[3px]">
        {rows.length ? (
          rows.map((row) => (
            <article
              className="flex items-center justify-between gap-3 min-h-11 px-3 py-2 rounded-sm bg-card border border-transparent transition-all duration-180 hover:bg-accent hover:border-border hover:translate-x-1"
              key={row.id}
            >
              <div className="grid gap-0.5 min-w-0">
                {row.href ? (
                  <Link href={row.href as Route}>
                    <strong className="text-sm font-medium text-foreground">{row.title}</strong>
                  </Link>
                ) : (
                  <strong className="text-sm font-medium text-foreground">{row.title}</strong>
                )}
                <span className="text-xs text-muted-foreground">{row.subtitle}</span>
              </div>
              <div className="text-xs text-muted-foreground/60 whitespace-nowrap">{row.meta ? <span>{row.meta}</span> : null}</div>
            </article>
          ))
        ) : (
          <EmptyState variant="empty" message="No records found" hint="Records will appear here once they are created or imported." />
        )}
      </div>
    </section>
  );
}
