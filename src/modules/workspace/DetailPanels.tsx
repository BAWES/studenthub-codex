import type { Route } from "next";
import Link from "next/link";

type Fact = {
  label: string;
  value: string | number | null | undefined;
};

type Row = {
  id: string | number;
  title: string;
  subtitle: string;
  meta?: string;
  href?: string;
};

export function FactPanel({ title, facts }: { title: string; facts: Fact[] }) {
  return (
    <section className="detailPanel">
      <h2>{title}</h2>
      <div className="factGrid">
        {facts.map((fact) => (
          <div className="fact" key={fact.label}>
            <span>{fact.label}</span>
            <strong>{fact.value || "Not set"}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CompactList({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <section className="detailPanel">
      <div className="listHeader compact">
        <h2>{title}</h2>
        <span>{rows.length}</span>
      </div>
      <div className="rows compactRows">
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
              {row.meta ? <div className="rowMeta">{row.meta}</div> : null}
            </article>
          ))
        ) : (
          <p className="emptyState">No imported records found here yet.</p>
        )}
      </div>
    </section>
  );
}
