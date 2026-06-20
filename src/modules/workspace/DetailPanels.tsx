"use client";

import type { Route } from "next";
import Link from "next/link";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
    <div className="grid gap-2 p-3 rounded-sm border border-destructive/30 bg-destructive/5" role="alert">
      <p className="text-sm text-destructive">{error}</p>
      {onRetry && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
        >
          Try again
        </Button>
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
      <section className="grid gap-3">
        <h2 className="m-0 text-sm font-semibold text-foreground">{title}</h2>
        <ErrorState error={errorMessage} onRetry={onRetry} />
      </section>
    );
  }

  /* ─── Loading state ─── */
  if (loading) {
    return (
      <section className="grid gap-3">
        <h2 className="m-0 text-sm font-semibold text-foreground">{title}</h2>
        {type === "list" ? (
          <div className="grid gap-[3px]" aria-busy="true">
            {Array.from({ length: 3 }).map((_, i) => (
              <div className="flex items-center gap-3 min-h-11 px-3 py-2" key={i}>
                <div className="grid gap-1 min-w-0 flex-1">
                  <Skeleton className="h-4 w-48 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="grid gap-0.5" key={i}>
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
      <section className="grid gap-3">
        <div className="flex items-center justify-between">
          <h2 className="m-0 text-sm font-semibold text-foreground">{title}</h2>
          {hasSensitive && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSensitiveRevealed((v) => !v)}
              className="text-xs text-muted-foreground h-auto min-h-0 px-2 py-1"
            >
              {sensitiveRevealed ? "Hide sensitive" : "Show sensitive"}
            </Button>
          )}
        </div>
        {facts && facts.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
            {facts.map((fact) => (
              <div className="grid gap-0.5" key={fact.label}>
                <span className="text-xs text-muted-foreground font-medium">{fact.label}</span>
                <strong className="text-sm font-medium text-foreground">
                  {fact.sensitive && !sensitiveRevealed
                    ? "•••••"
                    : fact.value ?? <span className="text-muted-foreground italic">Not set</span>}
                </strong>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">{emptyMessage ?? EMPTY_NO_SECTION_DATA}</p>
        )}
      </section>
    );
  }

  /* ─── List (CompactList) type ─── */
  const resolvedRows = rows ?? [];
  return (
    <section className="grid gap-2">
      <div className="flex items-center justify-between">
        <h2 className="m-0 text-sm font-semibold text-foreground">{title}</h2>
        {resolvedRows.length > 0 && <span className="text-xs text-muted-foreground font-medium">{resolvedRows.length}</span>}
      </div>
      {resolvedRows.length > 0 ? (
        <div className="grid gap-[3px]">
          {resolvedRows.map((row) => (
            <article
              className="flex items-center justify-between gap-3 min-h-11 px-3 py-2 rounded-sm bg-card border border-transparent transition-all duration-180 hover:bg-accent hover:border-border hover:translate-x-1"
              key={row.id}
            >
              <div className="grid gap-0.5 min-w-0 flex-1">
                {row.href ? (
                  <Link href={row.href as Route}>
                    <strong className="text-sm font-medium text-foreground">{row.title}</strong>
                  </Link>
                ) : (
                  <strong className="text-sm font-medium text-foreground">{row.title}</strong>
                )}
                <span className="text-xs text-muted-foreground">{row.subtitle}</span>
              </div>
              {row.meta ? (
                <div className="text-xs text-muted-foreground/60 whitespace-nowrap shrink-0">{row.meta}</div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">{emptyMessage ?? EMPTY_NO_IMPORTED_RECORDS}</p>
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
