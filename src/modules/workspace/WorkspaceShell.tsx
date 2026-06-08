"use client";

import type { SessionUser } from "@/modules/auth/types";
import type { Route } from "next";
import Link from "next/link";
import { navForRole } from "./navigation";
import { WorkspaceMobileNavigation } from "./WorkspaceNavigation";
import { EmptyState } from "./EmptyState";

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
  const navItems = navForRole(session.role);

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
          {metrics.map((metric) => (
            <article className="metric" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{typeof metric.value === "number" ? metric.value.toLocaleString("en-US") : metric.value}</strong>
              <p>{metric.note}</p>
            </article>
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

  return (
    <main className="shell shellEmbedded">
      {stage}
      <WorkspaceMobileNavigation items={navItems} role={session.role} />
    </main>
  );
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
          <EmptyState />
        )}
      </div>
    </section>
  );
}
