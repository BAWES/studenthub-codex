"use client";

import type { LucideIcon } from "lucide-react";
import { ArrowLeftIcon } from "lucide-react";
import { FactPanel } from "./DetailPanels";
import { DetailPageSkeleton } from "./Skeletons";
import { ActionButton } from "./ActionButton";
import type { ActionButtonVariant } from "./ActionButton";
import { EMPTY_NO_RELATED_RECORDS } from "./emptyStates";
import Link from "next/link";
import type { Route } from "next";

// ── Types ──────────────────────────────────────────────────

export type DetailFactSection = {
  title: string;
  facts: { label: string; value: string | number | null | undefined }[];
};

export type DetailRelatedRecord = {
  id: string | number;
  title: string;
  subtitle: string;
  meta?: string;
  href?: string;
};

export type DetailPageAction = {
  /** Button label text. */
  label: string;
  /** Click handler. */
  onClick?: () => void;
  /** Visual variant. Default: "primary". */
  variant?: ActionButtonVariant;
  /** Optional Lucide icon component reference (e.g. Pencil, Trash2). */
  icon?: LucideIcon;
  /** Optional capability required to see this action. */
  requireCapability?: string;
};

export type DetailPageProps = {
  /** Page title (typically the record name). */
  title: string;
  /** Eyebrow text above the title (e.g. "Candidate", "Request"). */
  eyebrow?: string;
  /** Fact sections to display as panels. */
  factSections: Record<string, DetailFactSection["facts"]>;
  /** Standardized action buttons rendered in the toolbar. */
  actions?: DetailPageAction[];
  /** Back link href — renders a back arrow. */
  backHref?: Route;
  /** Related records section configuration. */
  relatedRecords?: {
    title: string;
    rows: DetailRelatedRecord[];
  };
  /** Loading state — shows skeleton when true. */
  loading?: boolean;
  /** Error message — shows error state when set. */
  error?: string | null;
  /** Retry callback rendered in the error state. */
  onRetry?: () => void;
  /** Optional className override. */
  className?: string;
};

// ── Component ──────────────────────────────────────────────

export function DetailPage({
  title,
  eyebrow,
  factSections,
  actions,
  backHref,
  relatedRecords,
  loading = false,
  error = null,
  onRetry,
  className,
}: DetailPageProps) {
  // ── Loading state ────────────────────────────────────────
  if (loading) {
    return (
      <div className={className}>
        <DetailPageSkeleton panels={Object.keys(factSections).length || 3} />
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────
  if (error) {
    return (
      <section className={className}>
        <div className="errorState">
          <strong>Error loading details</strong>
          <span>{error}</span>
          {onRetry ? (
            <ActionButton variant="outline" onClick={onRetry}>
              Retry
            </ActionButton>
          ) : null}
        </div>
      </section>
    );
  }

  const sectionEntries = Object.entries(factSections);

  return (
    <section className={className}>
      {/* Back link */}
      {backHref ? (
        <nav className="backLink">
          <Link href={backHref}>
            <ArrowLeftIcon size={16} aria-hidden="true" />
            Back
          </Link>
        </nav>
      ) : null}

      {/* Eyebrow + title + action bar */}
      <section className="detailHero">
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{eyebrow}</p> : null}
        <div className="detailHeroRow">
          <h1>{title}</h1>
          {actions && actions.length > 0 ? (
            <div className="detailActions">
              {actions.map((action) => (
                <ActionButton
                  key={action.label}
                  variant={action.variant ?? "primary"}
                  icon={action.icon ? <span aria-hidden="true"><action.icon size={16} /></span> : undefined}
                  onClick={action.onClick}
                >
                  {action.label}
                </ActionButton>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Fact panels */}
      {sectionEntries.length > 0 ? (
        <div className="detailFactPanels">
          {sectionEntries.map(([sectionTitle, facts]) => (
            <FactPanel key={sectionTitle} title={sectionTitle} facts={facts} />
          ))}
        </div>
      ) : null}

      {/* Related records */}
      {relatedRecords ? (
        <section className="detailRelated">
          <h2>{relatedRecords.title}</h2>
          <div className="divide-y divide-border">
            {relatedRecords.rows.map((row) => (
              <article className="flex items-center justify-between gap-3 px-4 py-3 min-h-0" key={row.id}>
                <div className="min-w-0 grid gap-0.5">
                  {row.href ? (
                    <a href={row.href}>
                      <strong>{row.title}</strong>
                    </a>
                  ) : (
                    <strong>{row.title}</strong>
                  )}
                  <span>{row.subtitle}</span>
                </div>
                {row.meta ? <div className="shrink-0 text-xs text-muted-foreground"><span>{row.meta}</span></div> : null}
              </article>
            ))}
            {relatedRecords.rows.length === 0 ? (
              <p className="emptyState">{EMPTY_NO_RELATED_RECORDS}</p>
            ) : null}
          </div>
        </section>
      ) : null}
    </section>
  );
}
