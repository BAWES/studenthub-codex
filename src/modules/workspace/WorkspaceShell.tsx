"use client";

import type { SessionUser } from "@/modules/auth/types";
import type { Route } from "next";
import { logoutAction } from "@/modules/auth/actions";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";
import Link from "next/link";
import { navForRole } from "./navigation";
import { WorkspaceMobileNavigation, WorkspaceNavigation } from "./WorkspaceNavigation";
import { useWorkspaceOS } from "./WorkspaceOSContext";

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
    <aside className="sticky top-0 h-svh grid grid-rows-[auto_minmax(0,1fr)_auto] justify-items-center gap-3 border-r border-[#e2e6ee] bg-[var(--surface)] py-3.5 px-3 max-md:hidden">
      <Link className="w-full min-h-12 flex items-center gap-2.5 border border-[var(--line)] rounded-lg bg-[var(--ink)] text-[var(--surface)] px-3 no-underline dark:bg-[#e7ecf5] dark:text-[#090d14]" href="/app" aria-label="StudentHub app">
        <span className="w-[30px] h-[30px] inline-flex items-center justify-center rounded-md bg-[rgba(255,255,255,0.14)] font-black dark:bg-[rgba(9,13,20,0.12)]">SH</span>
        <strong className="text-[15px] font-black">StudentHub</strong>
      </Link>
      <WorkspaceNavigation items={navItems} role={session.role} />
      <div className="w-full grid gap-2">
        <ThemeToggle />
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full min-h-10 border border-[var(--line)] rounded-lg bg-[var(--surface-soft)] text-[var(--ink)] text-[13px] font-black cursor-pointer hover:border-[var(--blue)] hover:text-[var(--blue)]"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );

  const stage = (
    <section className="min-w-0 w-[calc(100vw-236px)] overflow-x-hidden grid content-start gap-3.5 p-3.5 max-md:w-auto max-md:p-2.5 max-md:pb-[76px]">
      <section className="grid grid-cols-[minmax(0,1fr)_minmax(220px,300px)] items-center gap-[18px] border border-[#dfe4ed] rounded-lg bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] p-4 dark:border-[var(--line)] dark:bg-[var(--surface)] dark:text-[var(--ink)]">
        <div>
          <p className="text-[var(--blue)] text-xs font-bold uppercase m-0 mb-2.5">{eyebrow}</p>
          <h1>{title}</h1>
        </div>
        <div className="min-w-0 grid gap-1.5 p-3.5 border border-[var(--line)] bg-[var(--surface)] rounded-lg">
          <span className="text-[var(--blue)] text-xs font-bold uppercase">{session.role}</span>
          <strong className="overflow-hidden text-ellipsis whitespace-nowrap">{session.name}</strong>
          <small className="text-[var(--muted)] overflow-hidden text-ellipsis">{session.email}</small>
        </div>
      </section>

      {metrics.length ? (
        <section className="grid grid-cols-4 gap-3 max-[1040px]:grid-cols-1" aria-label={`${session.role} workspace metrics`}>
          {metrics.map((metric) => (
            <article className="min-h-[118px] p-[18px] border border-[var(--line)] bg-[var(--surface)] dark:border-[var(--line)] dark:bg-[var(--surface)] dark:text-[var(--ink)]" key={metric.label}>
              <span className="text-[var(--blue)] text-[11px] font-black uppercase">{metric.label}</span>
              <strong className="block text-[38px] leading-none my-4 mx-0">{typeof metric.value === "number" ? metric.value.toLocaleString("en-US") : metric.value}</strong>
              <p className="text-[var(--faint)] mb-0">{metric.note}</p>
            </article>
          ))}
        </section>
      ) : null}

      {children}

      <section className="grid grid-cols-2 gap-3 max-[1040px]:grid-cols-1">
        {primary ? <WorkspaceList title={primary.title} rows={primary.rows} /> : null}
        {secondary ? <WorkspaceList title={secondary.title} rows={secondary.rows} /> : null}
      </section>
    </section>
  );

  // When embedded in a WorkspaceOS layout, the layout already provides the rail and mobile nav.
  if (embedded) {
    return (
      <main className="block min-h-0">
        {stage}
        <WorkspaceMobileNavigation items={navItems} role={session.role} />
      </main>
    );
  }

  return (
    <main className="grid grid-cols-[236px_minmax(0,1fr)] min-h-svh bg-[var(--paper)] max-md:block">
      {rail}
      {stage}
      <WorkspaceMobileNavigation items={navItems} role={session.role} />
    </main>
  );
}

function WorkspaceList({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <section className="border border-[var(--line)] bg-[var(--surface)]">
      <div className="min-h-[62px] flex items-center justify-between gap-4 px-[18px] py-[18px] pb-3.5 border-b border-[var(--line)]">
        <h2 className="mb-0">{title}</h2>
        <span className="min-w-[30px] min-h-[30px] inline-flex items-center justify-center text-[var(--blue)] border border-[#b7cff0] bg-[#eef5ff] font-bold">{rows.length}</span>
      </div>
      <div className="grid">
        {rows.length ? (
          rows.map((row) => (
            <article
              className="min-h-[72px] grid grid-cols-[minmax(0,1fr)_minmax(126px,auto)] gap-4 px-[18px] py-3.5 border-b border-[var(--line)] last:border-b-0"
              key={row.id}
            >
              <div className="min-w-0 grid content-center gap-1.5">
                {row.href ? (
                  <Link
                    className="text-inherit no-underline hover:text-[var(--blue)] hover:underline hover:underline-offset-[3px]"
                    href={row.href as Route}
                  >
                    <strong className="block overflow-hidden text-ellipsis whitespace-nowrap">{row.title}</strong>
                  </Link>
                ) : (
                  <strong className="block overflow-hidden text-ellipsis whitespace-nowrap">{row.title}</strong>
                )}
                <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[var(--muted)]">{row.subtitle}</span>
              </div>
              <div className="min-w-0 grid content-center justify-items-end text-right gap-1.5">
                {row.meta ? <span className="text-[var(--muted)]">{row.meta}</span> : null}
              </div>
            </article>
          ))
        ) : (
          <div className="grid gap-1.5 p-[18px] text-[var(--muted)]">
            <strong className="text-[var(--ink)] text-[15px]">No items here</strong>
            <span>The imported database did not return rows for this panel.</span>
          </div>
        )}
      </div>
    </section>
  );
}
