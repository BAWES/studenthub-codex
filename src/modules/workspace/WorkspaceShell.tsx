"use client";

import type { SessionUser } from "@/modules/auth/types";
import type { Route } from "next";
import { logoutAction } from "@/modules/auth/actions";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { navForRole } from "./navigation";
import { WorkspaceMobileNavigation, WorkspaceNavigation } from "./WorkspaceNavigation";
import { useWorkspaceOS } from "./WorkspaceOSContext";
import { EmptyState } from "./EmptyState";
import { MetricCard } from "@/components/ui/metric-card";

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
    <aside className="workspaceRail" aria-label="Workspace sidebar">
      <Link className="workspaceMark" href="/app" aria-label="StudentHub app">
        <span>SH</span>
        <strong>StudentHub</strong>
      </Link>
      <WorkspaceNavigation items={navItems} role={session.role} />
      <div className="workspaceRailDivider" aria-hidden="true" />
      <div className="workspaceRailFooter">
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
    <section className="workspaceStage">
      <section className="topbar">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
        </div>
        <div className="accountBox">
          <span>{session.role}</span>
          <strong>{session.name}</strong>
          <small>{session.email}</small>
        </div>
      </section>

      {metrics.length ? (
        <section className="metrics" aria-label={`${session.role} workspace metrics`}>
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
      <main className="shell shellEmbedded">
        {stage}
        <WorkspaceMobileNavigation items={navItems} role={session.role} />
      </main>
    )
    : (
      <>
        {skipLink}
        <main id="main-content" className="shell">
          {rail}
          {stage}
          <WorkspaceMobileNavigation items={navItems} role={session.role} />
        </main>
      </>
    );

  return mainContent;
}

function WorkspaceList({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <section className="dataList">
      <div className="listHeader">
        <h2>{title}</h2>
        <span>{rows.length}</span>
      </div>
      <div className="rows">
        {rows.length ? (
          rows.map((row) => (
            <article className="row" key={row.id}>
              <div className="rowMain">
                {row.href ? (
                  <Link href={row.href as Route}>
                    <strong>{row.title}</strong>
                  </Link>
                ) : (
                  <strong>{row.title}</strong>
                )}
                <span>{row.subtitle}</span>
              </div>
              <div className="rowMeta">{row.meta ? <span>{row.meta}</span> : null}</div>
            </article>
          ))
        ) : (
          <EmptyState variant="empty" message="No records found" hint="Records will appear here once they are created or imported." />
        )}
      </div>
    </section>
  );
}
