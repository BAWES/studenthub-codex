"use client";

import type { ReactNode } from "react";
import { FactPanel } from "./DetailPanels";
import { DetailPageSkeleton } from "./Skeletons";

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

export type DetailPageProps = {
  /** Page title (typically the record name). */
  title: string;
  /** Eyebrow text above the title (e.g. "Candidate", "Request"). */
  eyebrow?: string;
  /** Fact sections to display as panels. */
  factSections: Record<string, DetailFactSection["facts"]>;
  /** Action buttons rendered in the toolbar (e.g. Edit, Delete). */
  actions?: ReactNode;
  /** Related records section configuration. */
  relatedRecords?: {
    title: string;
    rows: DetailRelatedRecord[];
  };
  /** Loading state — shows skeleton when true. */
  loading?: boolean;
  /** Error message — shows error state when set. */
  error?: string | null;
  /** Optional className override. */
  className?: string;
};

// ── Component ──────────────────────────────────────────────

export function DetailPage({
  title,
  eyebrow,
  factSections,
  actions,
  relatedRecords,
  loading = false,
  error = null,
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
        </div>
      </section>
    );
  }

  const sectionEntries = Object.entries(factSections);

  return (
    <section className={className}>
      {/* Eyebrow + title */}
      <section className="detailHero">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <div className="detailHeroRow">
          <h1>{title}</h1>
          {actions ? <div className="detailActions">{actions}</div> : null}
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
          <div className="rows">
            {relatedRecords.rows.map((row) => (
              <article className="row" key={row.id}>
                <div className="rowMain">
                  {row.href ? (
                    <a href={row.href}>
                      <strong>{row.title}</strong>
                    </a>
                  ) : (
                    <strong>{row.title}</strong>
                  )}
                  <span>{row.subtitle}</span>
                </div>
                {row.meta ? <div className="rowMeta"><span>{row.meta}</span></div> : null}
              </article>
            ))}
            {relatedRecords.rows.length === 0 ? (
              <p className="emptyState">No related records found.</p>
            ) : null}
          </div>
        </section>
      ) : null}
    </section>
  );
}
