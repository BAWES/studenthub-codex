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

export function DetailSection({
  title,
  facts,
  rows,
  type = "fact",
  loading,
  error,
  onRetry,
  hidden,
  emptyMessage,
  sensitive,
}: {
  title: string;
  facts?: Fact[];
  rows?: Row[];
  type?: "fact" | "list";
  loading?: boolean;
  error?: string | Error | null;
  onRetry?: () => void;
  hidden?: boolean;
  emptyMessage?: string;
  sensitive?: boolean;
}) {
  if (hidden) return null;

  if (loading) {
    return (
      <section className="detailPanel loading">
        <h2>{title}</h2>
        <div className="skeletonRows">
          <div className="skeleton" />
          <div className="skeleton" />
          <div className="skeleton" />
        </div>
      </section>
    );
  }

  if (error) {
    const msg = typeof error === "string" ? error : error.message;
    return (
      <section className="detailPanel error">
        <h2>{title}</h2>
        <p className="errorMessage">{msg}</p>
        {onRetry && (
          <button onClick={onRetry} className="retryBtn">
            Retry
          </button>
        )}
      </section>
    );
  }

  if (type === "list" && rows) {
    return <CompactList title={title} rows={rows} />;
  }

  return <FactPanel title={title} facts={facts ?? []} sensitive={sensitive} emptyMessage={emptyMessage} />;
}

export function FactPanel({ title, facts, sensitive, emptyMessage }: { title: string; facts: Fact[]; sensitive?: boolean; emptyMessage?: string }) {
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
