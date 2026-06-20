"use client";

import type { Route } from "next";
import Link from "next/link";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EMPTY_NO_SECTION_DATA,
  EMPTY_NO_IMPORTED_RECORDS,
} from "./emptyStates";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DetailSectionFact = {
  label: string;
  value: React.ReactNode | null | undefined;
  sensitive?: boolean;
};

export type DetailSectionRow = {
  id: string | number;
  title: string;
  subtitle: string;
  meta?: string;
  href?: string;
};

export type DetailSectionType = "fact" | "list";

export interface DetailSectionProps {
  /** Section type — "fact" renders a label/value grid, "list" renders a compact row list */
  type?: DetailSectionType;
  /** Section heading */
  title: string;
  /** Facts for type="fact" */
  facts?: DetailSectionFact[];
  /** Rows for type="list" */
  rows?: DetailSectionRow[];
  // ---- States ----
  loading?: boolean;
  error?: Error | string | null;
  /** Custom empty-state message (default differs per type) */
  emptyMessage?: string;
  /** Called when the user clicks "Try again" in error state */
  onRetry?: () => void;
  // ---- Role scoping ----
  /** If set, the section only renders when one of these matches the current role */
  roles?: string[];
  /** When true, non-sensitive fact values are revealed via a toggle */
  sensitive?: boolean;
  /** When true, the section is never rendered (for conditional display control) */
  hidden?: boolean;
}

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------

function ErrorState({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="errorState" role="alert">
      <p>{error}</p>
      {onRetry && (
        <button
          type="button"
          className="uiButton uiButtonGhost"
          onClick={onRetry}
        >
          Try again
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DetailSection — unified detail panel section
// ---------------------------------------------------------------------------

export function DetailSection({
  type = "fact",
  title,
  facts,
  rows,
  loading = false,
  error = null,
  emptyMessage,
  onRetry,
  sensitive = false,
  hidden = false,
}: DetailSectionProps) {
  const [sensitiveRevealed, setSensitiveRevealed] = React.useState(false);

  if (hidden) return null;

  const errorMessage =
    error instanceof Error ? error.message : typeof error === "string" ? error : null;

  /* ─── Error state ─── */
  if (errorMessage) {
    return (
      <section className="detailPanel">
        <h2>{title}</h2>
        <ErrorState error={errorMessage} onRetry={onRetry} />
      </section>
    );
  }

  /* ─── Loading state ─── */
  if (loading) {
    return (
      <section className="detailPanel">
        <h2>{title}</h2>
        {type === "list" ? (
          <div className="divide-y divide-border compactRows" aria-busy="true">
            {Array.from({ length: 3 }).map((_, i) => (
              <article className="flex items-center justify-between gap-3 px-4 py-3 min-h-0" key={i}>
                <div className="min-w-0 grid gap-0.5">
                  <Skeleton className="h-4 w-48 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="factGrid" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="fact" key={i}>
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  /* ─── Fact type ─── */
  if (type === "fact") {
    const hasSensitive = sensitive && facts?.some((f) => f.sensitive);

    return (
      <section className="detailPanel">
        <div className="flex items-center justify-between gap-2.5 border-b border-border px-4 py-3">
          <h2>{title}</h2>
          {hasSensitive && (
            <button
              type="button"
              className="uiButton uiButtonGhost"
              onClick={() => setSensitiveRevealed((v) => !v)}
              style={{ fontSize: "0.75rem" }}
            >
              {sensitiveRevealed ? "Hide sensitive" : "Show sensitive"}
            </button>
          )}
        </div>
        {facts && facts.length > 0 ? (
          <div className="factGrid">
            {facts.map((fact) => (
              <div className="fact" key={fact.label}>
                <span>{fact.label}</span>
                <strong>
                  {fact.sensitive && !sensitiveRevealed
                    ? "•••••"
                    : fact.value ?? "Not set"}
                </strong>
              </div>
            ))}
          </div>
        ) : (
          <p className="emptyState">{emptyMessage ?? EMPTY_NO_SECTION_DATA}</p>
        )}
      </section>
    );
  }

  /* ─── List (CompactList) type ─── */
  const resolvedRows = rows ?? [];
  return (
    <section className="detailPanel">
      <div className="flex items-center justify-between gap-2.5 border-b border-border px-4 py-3 compact">
        <h2>{title}</h2>
        {resolvedRows.length > 0 && <span>{resolvedRows.length}</span>}
      </div>
      {resolvedRows.length > 0 ? (
        <div className="divide-y divide-border compactRows">
          {resolvedRows.map((row) => (
            <article className="flex items-center justify-between gap-3 px-4 py-3 min-h-0" key={row.id}>
              <div className="min-w-0 grid gap-0.5">
                {row.href ? (
                  <Link href={row.href as Route}>
                    <strong>{row.title}</strong>
                  </Link>
                ) : (
                  <strong>{row.title}</strong>
                )}
                <span>{row.subtitle}</span>
              </div>
              {row.meta ? <div className="shrink-0 text-xs text-muted-foreground">{row.meta}</div> : null}
            </article>
          ))}
        </div>
      ) : (
        <p className="emptyState">{emptyMessage ?? EMPTY_NO_IMPORTED_RECORDS}</p>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Deprecated wrappers — kept for backward compatibility
// Prefer <DetailSection> for new code.
// ---------------------------------------------------------------------------

/** @deprecated Use <DetailSection type="fact" /> instead */
export function FactPanel({
  title,
  facts,
}: {
  title: string;
  facts: { label: string; value: string | number | null | undefined }[];
}) {
  return (
    <DetailSection
      type="fact"
      title={title}
      facts={facts.map((f) => ({ label: f.label, value: f.value }))}
    />
  );
}

/** @deprecated Use <DetailSection type="list" /> instead */
export function CompactList({
  title,
  rows,
}: {
  title: string;
  rows: { id: string | number; title: string; subtitle: string; meta?: string; href?: string }[];
}) {
  return (
    <DetailSection type="list" title={title} rows={rows} />
  );
}
