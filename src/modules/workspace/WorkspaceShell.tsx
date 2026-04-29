import type { SessionUser } from "@/modules/auth/types";
import { logoutAction } from "@/modules/auth/actions";
import Link from "next/link";
import { navForRole } from "./navigation";

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

  return (
    <main className="shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
        </div>
        <div className="accountBox">
          <span>{session.role}</span>
          <strong>{session.name}</strong>
          <small>{session.email}</small>
          <form action={logoutAction}>
            <button type="submit">Sign out</button>
          </form>
        </div>
      </section>

      <nav className="workspaceNav" aria-label={`${session.role} navigation`}>
        {navItems.map((item) => (
          <Link href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      <nav className="mobileTabBar" aria-label={`${session.role} mobile navigation`}>
        {navItems.map((item) => (
          <Link href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>

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
                <strong>{row.title}</strong>
                <span>{row.subtitle}</span>
              </div>
              <div className="rowMeta">{row.meta ? <span>{row.meta}</span> : null}</div>
            </article>
          ))
        ) : (
          <div className="emptyState">
            <strong>No items here</strong>
            <span>This account has no matching production rows for this slice.</span>
          </div>
        )}
      </div>
    </section>
  );
}
