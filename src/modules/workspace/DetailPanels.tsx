"use client";

import { useState } from "react";
import type { Route } from "next";
import Link from "next/link";

export type DetailSectionFact = {
  label: string;
  value: string | number | null | undefined;
  sensitive?: boolean;
};

export type DetailSectionRow = {
  id: string | number;
  title: string;
  subtitle: string;
  meta?: string;
  href?: string;
};

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

// ---------------------------------------------------------------------------
// DetailSection — primary component
// ---------------------------------------------------------------------------

type DetailSectionProps = {
  title: string;
  type?: "fact" | "list";
  facts?: DetailSectionFact[];
  rows?: DetailSectionRow[];
  emptyMessage?: string;
  sensitive?: boolean;
  loading?: boolean;
  error?: string | Error;
  onRetry?: () => void;
  hidden?: boolean;
};

export function DetailSection({
  title,
  type = "fact",
  facts,
  rows,
  emptyMessage,
  sensitive,
  loading,
  error,
  onRetry,
  hidden,
}: DetailSectionProps) {
  if (hidden) return null;

  const errorMessage =
    typeof error === "string" ? error : error instanceof Error ? error.message : null;

  if (errorMessage) {
    return (
      <section className="detailPanel" data-testid="detail-section-error">
        <h2>{title}</h2>
        <p className="text-sm text-destructive">{errorMessage}</p>
        {onRetry && (
          <button onClick={onRetry} className="text-sm font-medium text-primary underline">
            Try again
          </button>
        )}
      </section>
    );
  }

  if (loading) {
    return (
      <section className="detailPanel" aria-busy="true">
        <h2>{title}</h2>
        <div className="skeleton">
          <div className="skeleton-row" />
          <div className="skeleton-row" />
          <div className="skeleton-row" />
        </div>
      </section>
    );
  }

  if (type === "fact") {
    return (
      <FactSection
        title={title}
        facts={facts ?? []}
        emptyMessage={emptyMessage}
        sensitive={sensitive}
      />
    );
  }

  return (
    <ListSection
      title={title}
      rows={rows ?? []}
      emptyMessage={emptyMessage}
    />
  );
}

// ---------------------------------------------------------------------------
// FactSection — fact mode internals
// ---------------------------------------------------------------------------

function FactSection({
  title,
  facts,
  emptyMessage,
  sensitive: globallySensitive,
}: {
  title: string;
  facts: DetailSectionFact[];
  emptyMessage?: string;
  sensitive?: boolean;
}) {
  const [revealed, setRevealed] = useState(false);

  if (facts.length === 0) {
    return (
      <section className="detailPanel" data-testid="empty-section">
        <h2>{title}</h2>
        <p className="emptyState">{emptyMessage ?? "No data for this section."}</p>
      </section>
    );
  }

  return (
    <section className="detailPanel">
      <h2>{title}</h2>
      <div className="factGrid">
        {facts.map((fact) => (
          <div className="fact" key={fact.label}>
            <span>{fact.label}</span>
            <strong>
              {globallySensitive && !revealed
                ? "•••••"
                : fact.value != null
                  ? String(fact.value)
                  : "Not set"}
            </strong>
          </div>
        ))}
      </div>
      {globallySensitive && !revealed && (
        <button
          onClick={() => setRevealed(true)}
          className="text-xs font-medium text-primary underline mt-2"
        >
          Show sensitive
        </button>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// ListSection — list mode internals
// ---------------------------------------------------------------------------

function ListSection({
  title,
  rows,
  emptyMessage,
}: {
  title: string;
  rows: DetailSectionRow[];
  emptyMessage?: string;
}) {
  if (rows.length === 0) {
    return (
      <section className="detailPanel">
        <div className="listHeader compact">
          <h2>{title}</h2>
          <span>0</span>
        </div>
        <p className="emptyState">{emptyMessage ?? "No imported records found here yet."}</p>
      </section>
    );
  }

  return (
    <section className="detailPanel">
      <div className="listHeader compact">
        <h2>{title}</h2>
        <span>{rows.length}</span>
      </div>
      <div className="rows compactRows">
        {rows.map((row) => (
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
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Deprecated wrappers (backward compat)
// ---------------------------------------------------------------------------

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
