"use client";

import type { SessionUser } from "@/modules/auth/types";
import type { Route } from "next";
import { logoutAction } from "@/modules/auth/actions";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { navForRole } from "./navigation";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
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
    <aside className="group/rail sticky top-0 h-screen grid grid-rows-[auto_minmax(0,1fr)_auto] content-start gap-1 overflow-hidden z-30 border-r border-border transition-[width,padding] duration-300 w-14 p-2 hover:w-[200px] hover:border-r-[color-mix(in_srgb,#eb6651_30%,hsl(var(--border)))]" aria-label="Workspace sidebar">
      <Link className="flex items-center justify-center w-11 h-11 border border-border rounded-[calc(var(--radius)-2px)] bg-foreground text-background overflow-hidden no-underline transition-all duration-300 hover:w-full hover:gap-2.5 hover:justify-start hover:px-2.5 hover:rounded-[calc(var(--radius)-2px)]" href="/app" aria-label="StudentHub app">
        <span className="inline-flex items-center justify-center shrink-0 w-7 h-7 rounded-md bg-[#eb6651] text-white text-[11px] font-bold leading-none">SH</span>
        <strong className="text-sm font-semibold whitespace-nowrap opacity-0 transition-opacity duration-200 delay-100 group-hover/rail:opacity-100">StudentHub</strong>
      </Link>
      <WorkspaceNavigation items={navItems} role={session.role} />
      <Separator className="mx-2 my-1" />
      <div className="flex flex-col gap-1 w-11 transition-[width] duration-300 group-hover/rail:w-full">
        <RoleSwitcher
          currentRole={session.role}
          availableRoles={(session.roles ?? [session.role]) as any}
        />
        <ThemeToggle />
        <form action={logoutAction}>
          <Button type="submit" variant="ghost" size="icon" aria-label="Sign out">
            <LogOut size={18} strokeWidth={1.5} aria-hidden="true" />
          </Button>
        </form>
      </div>
    </aside>
  );

  const stage = (
    <section className="min-w-0 overflow-x-hidden grid content-start gap-3.5 p-3.5">
      <section className="flex items-center justify-between gap-4 border-b border-border pb-3 mb-1">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{eyebrow}</p>
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
        </div>
        <div className="min-w-[140px] max-w-[220px] grid content-center gap-0.5 rounded-lg border border-border bg-card p-2.5 text-right text-xs leading-tight">
          <span className="text-[11px] font-semibold uppercase text-muted-foreground">{session.role}</span>
          <strong className="truncate text-sm font-semibold">{session.name}</strong>
          <small className="truncate text-muted-foreground">{session.email}</small>
        </div>
      </section>

      {metrics.length ? (
        <section className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3" aria-label={`${session.role} workspace metrics`}>
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

      <section className="grid gap-4">
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
      <div className="shell shellEmbedded">
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
    <section className="border border-border rounded-lg bg-card overflow-hidden">
      <div className="flex items-center justify-between gap-2.5 border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="text-xs font-semibold uppercase text-muted-foreground">{rows.length}</span>
      </div>
      <div className="divide-y divide-border">
        {rows.length ? (
          rows.map((row) => (
            <article className="flex items-center justify-between gap-3 px-4 py-3 min-h-0" key={row.id}>
              <div className="min-w-0 grid gap-0.5">
                {row.href ? (
                  <Link href={row.href as Route} className="text-sm font-semibold text-foreground hover:underline">
                    {row.title}
                  </Link>
                ) : (
                  <strong className="text-sm font-semibold">{row.title}</strong>
                )}
                <span className="text-xs text-muted-foreground">{row.subtitle}</span>
              </div>
              <div className="shrink-0 text-xs text-muted-foreground">{row.meta ? <span>{row.meta}</span> : null}</div>
            </article>
          ))
        ) : (
          <div className="p-4">
            <EmptyState variant="empty" message="No records found" hint="Records will appear here once they are created or imported." />
          </div>
        )}
      </div>
    </section>
  );
}
