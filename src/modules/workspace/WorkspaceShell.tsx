"use client";

import type { SessionUser } from "@/modules/auth/types";
import type { Route } from "next";
import { logoutAction } from "@/modules/auth/actions";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";
import Link from "next/link";
import { navForRole } from "./navigation";
import { WorkspaceMobileNavigation, WorkspaceNavigation } from "./WorkspaceNavigation";
import { useWorkspaceOS } from "./WorkspaceOSContext";
import { Card, CardContent } from "@/components/ui/card";

type Metric = {
  label: string;
  value: string | number;
  note: string;
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
    <aside className="flex w-[236px] shrink-0 flex-col border-r border-border bg-card">
      <Link
        className="flex items-center gap-2 border-b border-border px-5 py-4 font-semibold text-foreground"
        href="/app"
        aria-label="StudentHub app"
      >
        <span className="flex size-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
          SH
        </span>
        <strong className="text-sm">StudentHub</strong>
      </Link>
      <WorkspaceNavigation items={navItems} role={session.role} />
      <div className="mt-auto flex items-center gap-2 border-t border-border px-4 py-3">
        <ThemeToggle />
        <form className="ml-auto" action={logoutAction}>
          <button
            type="submit"
            className="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );

  const stage = (
    <section className="flex flex-1 flex-col overflow-auto">
      {/* Top bar */}
      <section className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
        <div>
          <p className="text-blue-zendesk text-xs font-bold uppercase tracking-normal mb-2.5">{eyebrow}</p>
          <h1 className="max-w-[800px] mb-0 text-[clamp(27px,2.8vw,42px)] leading-[1.05] tracking-normal">{title}</h1>
        </div>
        <div className="min-w-0 grid gap-1.5 p-3.5 border border-border rounded-lg bg-card">
          <span className="text-blue-zendesk text-xs font-bold uppercase">{session.role}</span>
          <strong className="overflow-hidden text-ellipsis whitespace-nowrap">{session.name}</strong>
          <small className="text-muted-foreground overflow-hidden text-ellipsis">{session.email}</small>
        </div>
      </section>

      {/* Metrics grid */}
      {metrics.length ? (
        <section
          className="grid gap-4 p-6 pb-0 grid-cols-[repeat(auto-fill,minmax(200px,1fr))]"
          aria-label={`${session.role} workspace metrics`}
        >
          {metrics.map((metric) => (
            <Card key={metric.label}>
              <CardContent className="flex flex-col gap-1 p-4">
                <span className="text-xs font-medium text-muted-foreground">{metric.label}</span>
                <strong className="text-2xl font-bold text-foreground">
                  {typeof metric.value === "number" ? metric.value.toLocaleString("en-US") : metric.value}
                </strong>
                <p className="text-xs text-muted-foreground">{metric.note}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      ) : null}

      {children}

      {/* Lists grid */}
      <section className="grid gap-6 p-6 md:grid-cols-2">
        {primary ? <WorkspaceList title={primary.title} rows={primary.rows} /> : null}
        {secondary ? <WorkspaceList title={secondary.title} rows={secondary.rows} /> : null}
      </section>
    </section>
  );

  // When embedded in a WorkspaceOS layout, the layout already provides the rail and mobile nav.
  if (embedded) {
    return (
      <main className="flex min-h-0 flex-1 flex-col">
        {stage}
        <WorkspaceMobileNavigation items={navItems} role={session.role} />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen">
      {rail}
      {stage}
      <WorkspaceMobileNavigation items={navItems} role={session.role} />
    </main>
  );
}

function WorkspaceList({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <Card className="min-h-[360px]">
      <div className="flex items-center justify-between gap-4 px-4 py-3.5 border-b border-border">
        <h2 className="text-xl mb-0">{title}</h2>
        <span className="min-w-[30px] min-h-[30px] inline-flex items-center justify-center text-blue-zendesk border border-blue-zendesk/20 bg-blue-zendesk/5 font-bold text-sm rounded">{count}</span>
      </div>
      <div className="divide-y divide-border">
        {rows.length ? (
          rows.map((row) => (
            <article key={row.id} className="flex items-center justify-between px-5 py-3">
              <div className="flex flex-col gap-0.5">
                {row.href ? (
                  <Link href={row.href as Route} className="text-sm font-medium text-foreground hover:text-primary">
                    <strong>{row.title}</strong>
                  </Link>
                ) : (
                  <strong className="text-sm font-medium text-foreground">{row.title}</strong>
                )}
                <span className="text-xs text-muted-foreground">{row.subtitle}</span>
              </div>
              <div className="shrink-0 text-xs text-muted-foreground">
                {row.meta ? <span>{row.meta}</span> : null}
              </div>
            </article>
          ))
        ) : (
          <div className="flex flex-col items-center gap-1 px-5 py-8 text-center">
            <strong className="text-sm text-muted-foreground">No items here</strong>
            <span className="text-xs text-muted-foreground/70">
              The imported database did not return rows for this panel.
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
